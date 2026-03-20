"use client";

import { useState } from "react";
import { Member, Expense } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

interface ExpenseFormProps {
  members: Member[];
  initialExpense?: Expense;
  onSave: (expense: Expense) => void;
  onCancel: () => void;
}

export default function ExpenseForm({ members, initialExpense, onSave, onCancel }: ExpenseFormProps) {
  const formatNumber = (value: string | number) => {
    if (!value) return "";
    const numericOnly = value.toString().replace(/\D/g, "");
    if (!numericOnly) return "";
    return parseInt(numericOnly, 10).toLocaleString("en-US");
  };

  const getRawNumber = (formattedValue: string) => {
    return parseInt(formattedValue.replace(/,/g, ""), 10) || 0;
  };

  const [title, setTitle] = useState(initialExpense?.title || "");
  const [amount, setAmount] = useState(initialExpense ? formatNumber(initialExpense.totalAmount) : ""); 
  const [payerId, setPayerId] = useState(initialExpense ? Object.keys(initialExpense.paidBy)[0] : members[0]?.id || "");
  const [splitType, setSplitType] = useState<'equal' | 'exact' | 'adjustment'>(initialExpense?.splitType || 'equal');
  
  const [involvedIds, setInvolvedIds] = useState<string[]>(
    initialExpense?.splitType === 'equal' || initialExpense?.splitType === 'adjustment'
      ? Object.keys(initialExpense.owedBy).filter(id => {
          // if adjustment, only check them if their owed amount is greater than just their extra
          if (initialExpense.splitType === 'adjustment') {
             const extra = initialExpense.adjustments?.[id] || 0;
             return initialExpense.owedBy[id] > extra;
          }
          return true;
        })
      : members.map(m => m.id)
  );
  
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(
    initialExpense?.exactAmounts
      ? Object.entries(initialExpense.exactAmounts).reduce((acc, [k, v]) => ({ ...acc, [k]: formatNumber(v) }), {})
      : initialExpense?.splitType === 'exact' 
        ? Object.entries(initialExpense.owedBy).reduce((acc, [k, v]) => ({ ...acc, [k]: formatNumber(v) }), {})
        : {}
  );

  const [descriptions, setDescriptions] = useState<Record<string, string>>(initialExpense?.descriptions || {});

  // new state for adjustments
  const [adjustments, setAdjustments] = useState<Record<string, string>>(
    initialExpense?.adjustments
      ? Object.entries(initialExpense.adjustments).reduce((acc, [k, v]) => ({ ...acc, [k]: formatNumber(v) }), {})
      : {}
  );

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => setAmount(formatNumber(e.target.value));
  const handleExactAmountChange = (id: string, val: string) => setExactAmounts(prev => ({ ...prev, [id]: formatNumber(val) }));
  const handleDescriptionChange = (id: string, val: string) => setDescriptions(prev => ({ ...prev, [id]: val }));
  const handleAdjustmentChange = (id: string, val: string) => setAdjustments(prev => ({ ...prev, [id]: formatNumber(val) }));
  const toggleInvolved = (id: string) => setInvolvedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmountNum = getRawNumber(amount);

    if (!title.trim()) return alert("please enter a title for the expense.");
    if (totalAmountNum <= 0) return alert("please enter a valid total amount.");
    if (!payerId) return alert("please select who paid.");

    let owedBy: Record<string, number> = {};
    let savedExactAmounts: Record<string, number> = {};
    let savedAdjustments: Record<string, number> = {};

    if (splitType === 'equal') {
      if (involvedIds.length === 0) return alert("select at least one person to split with.");
      const splitAmount = totalAmountNum / involvedIds.length;
      involvedIds.forEach(id => { owedBy[id] = splitAmount; });
      
    } else if (splitType === 'exact') {
      let sumOfItems = 0;
      Object.entries(exactAmounts).forEach(([id, val]) => {
        const num = getRawNumber(val);
        if (num > 0) {
          savedExactAmounts[id] = num;
          sumOfItems += num;
        }
      });
      if (sumOfItems === 0) return alert("please enter at least one item price.");

      const ratio = totalAmountNum / sumOfItems;
      Object.entries(savedExactAmounts).forEach(([id, val]) => {
        owedBy[id] = val * ratio;
      });

    } else if (splitType === 'adjustment') {
      let sumAdjustments = 0;
      Object.entries(adjustments).forEach(([id, val]) => {
        const num = getRawNumber(val);
        if (num > 0) {
          savedAdjustments[id] = num;
          sumAdjustments += num;
        }
      });

      if (sumAdjustments > totalAmountNum) {
        return alert("the extra adjustments cannot be higher than the total bill!");
      }

      const remainingToSplit = totalAmountNum - sumAdjustments;
      const splitAmount = involvedIds.length > 0 ? remainingToSplit / involvedIds.length : 0;

      // add equal share + any extras
      involvedIds.forEach(id => {
        owedBy[id] = splitAmount + (savedAdjustments[id] || 0);
      });

      // catch people who only had an extra but weren't checked for the equal split
      Object.entries(savedAdjustments).forEach(([id, val]) => {
        if (!involvedIds.includes(id)) {
           owedBy[id] = val;
        }
      });

      if (Object.keys(owedBy).length === 0) return alert("please configure the split.");
    }

    onSave({
      id: initialExpense?.id || uuidv4(),
      title,
      totalAmount: totalAmountNum,
      paidBy: { [payerId]: totalAmountNum },
      owedBy,
      splitType,
      exactAmounts: splitType === 'exact' ? savedExactAmounts : undefined,
      descriptions: splitType === 'exact' ? descriptions : undefined,
      adjustments: splitType === 'adjustment' ? savedAdjustments : undefined
    });
  };

  const currentTotal = getRawNumber(amount);
  
  // exact split helpers
  let itemsSum = 0;
  Object.values(exactAmounts).forEach(v => itemsSum += getRawNumber(v));
  const difference = currentTotal - itemsSum;

  // adjustment helpers
  let adjSum = 0;
  Object.values(adjustments).forEach(v => adjSum += getRawNumber(v));
  const remainingAfterAdj = currentTotal - adjSum;

  return (
    <form onSubmit={handleSubmit} className="p-5 border border-gray-200 rounded-2xl bg-white space-y-5 shadow-sm">
      <div className="flex gap-4 w-full">
        <input 
          type="text" placeholder="what was it? (e.g. hotel)" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-2/3 border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-black bg-transparent min-w-0"
        />
        <input 
          type="text" inputMode="numeric" placeholder="total paid" value={amount} onChange={handleAmountChange}
          className="w-1/3 border-b border-gray-200 py-2 text-sm text-right focus:outline-none focus:border-black bg-transparent min-w-0"
        />
      </div>

      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <span className="text-xs text-gray-500">paid by</span>
        <select 
          value={payerId} onChange={(e) => setPayerId(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-md py-1 px-2 text-xs outline-none focus:border-black"
        >
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {/* the 3 tabs */}
      <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
        <button type="button" onClick={() => setSplitType('equal')} className={`flex-1 py-1.5 text-[11px] rounded-md transition-colors ${splitType === 'equal' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}>equal</button>
        <button type="button" onClick={() => setSplitType('exact')} className={`flex-1 py-1.5 text-[11px] rounded-md transition-colors ${splitType === 'exact' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}>itemized</button>
        <button type="button" onClick={() => setSplitType('adjustment')} className={`flex-1 py-1.5 text-[11px] rounded-md transition-colors ${splitType === 'adjustment' ? 'bg-white shadow-sm font-medium' : 'text-gray-500'}`}>adjustments</button>
      </div>

      <div className="space-y-3">
        {members.map(m => (
          <div key={m.id} className="flex flex-col py-1">
            <div className="flex justify-between items-center mb-1 gap-2">
              <span className="text-sm truncate flex-1">{m.name}</span>
              
              {(splitType === 'equal' || splitType === 'adjustment') && (
                <button 
                  type="button" onClick={() => toggleInvolved(m.id)}
                  className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition-colors ${involvedIds.includes(m.id) ? 'bg-black border-black text-white' : 'border-gray-300'}`}
                >
                  {involvedIds.includes(m.id) && <span className="text-[10px]">✓</span>}
                </button>
              )}

              {splitType === 'exact' && (
                <input 
                  type="text" inputMode="numeric" placeholder="menu price" 
                  value={exactAmounts[m.id] || ""} onChange={(e) => handleExactAmountChange(m.id, e.target.value)}
                  className="w-24 text-right border-b border-gray-200 text-sm focus:outline-none focus:border-black py-1 bg-transparent"
                />
              )}

              {splitType === 'adjustment' && (
                <input 
                  type="text" inputMode="numeric" placeholder="+ extra" 
                  value={adjustments[m.id] || ""} onChange={(e) => handleAdjustmentChange(m.id, e.target.value)}
                  className="w-20 text-right border-b border-gray-200 text-sm focus:outline-none focus:border-black py-1 bg-transparent"
                />
              )}
            </div>
            
            {splitType === 'exact' && (
              <input 
                type="text" placeholder="what did they get?" 
                value={descriptions[m.id] || ""} onChange={(e) => handleDescriptionChange(m.id, e.target.value)}
                className="w-full text-xs text-gray-500 focus:outline-none focus:text-black bg-transparent mt-1"
              />
            )}
          </div>
        ))}
      </div>

      {splitType === 'exact' && itemsSum > 0 && difference !== 0 && (
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 text-center">
          items sum to {itemsSum.toLocaleString()}. the {Math.abs(difference).toLocaleString()} {difference > 0 ? 'tax/fee' : 'discount'} will be split proportionally.
        </div>
      )}

      {splitType === 'adjustment' && currentTotal > 0 && (
        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 text-center">
          {remainingAfterAdj < 0 ? (
            <span className="text-red-500">extras exceed total bill!</span>
          ) : involvedIds.length === 0 ? (
            "select who splits the remaining amount."
          ) : (
            `extras sum to ${adjSum.toLocaleString()}. remaining ${remainingAfterAdj.toLocaleString()} split by ${involvedIds.length} (${Math.round(remainingAfterAdj / involvedIds.length).toLocaleString()} each).`
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-medium transition-colors border border-gray-200">cancel</button>
        <button type="submit" className="flex-1 py-2.5 bg-black text-white rounded-xl text-xs font-medium hover:bg-gray-800 transition-colors">{initialExpense ? 'update' : 'save'}</button>
      </div>
    </form>
  );
}