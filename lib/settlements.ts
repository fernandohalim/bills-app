import { Trip, Member } from './types';

export interface Transaction {
  from: Member;
  to: Member;
  amount: number;
}

export function calculateSettlements(trip: Trip): Transaction[] {
  if (!trip || trip.members.length === 0 || trip.expenses.length === 0) return [];

  const balances: Record<string, number> = {};
  trip.members.forEach(m => { balances[m.id] = 0; });

  trip.expenses.forEach(exp => {
    // 1. add what people paid
    if (exp.paidBy) {
      Object.entries(exp.paidBy).forEach(([memberId, amount]) => {
        if (balances[memberId] !== undefined) balances[memberId] += amount;
      });
    }

    // 2. subtract what people owe
    if (exp.owedBy) {
      Object.entries(exp.owedBy).forEach(([memberId, amount]) => {
        if (balances[memberId] !== undefined) balances[memberId] -= amount;
      });
    }

    // 3. handle direct in-expense settlements (e.g., ronal paid kitong 1m directly)
    if (exp.settledShares) {
      const payerId = Object.keys(exp.paidBy)[0]; // the person who originally paid the bill
      Object.entries(exp.settledShares).forEach(([memberId, isSettled]) => {
        if (isSettled && exp.owedBy[memberId] && payerId) {
           const amount = exp.owedBy[memberId];
           if (balances[memberId] !== undefined) balances[memberId] += amount; // ronal gets his balance back up
           if (balances[payerId] !== undefined) balances[payerId] -= amount;   // kitong's balance drops because he got the cash
        }
      });
    }
  });

  const debtors = trip.members
    .map(m => ({ member: m, balance: balances[m.id] }))
    .filter(m => m.balance < -0.01) 
    .sort((a, b) => a.balance - b.balance); 

  const creditors = trip.members
    .map(m => ({ member: m, balance: balances[m.id] }))
    .filter(m => m.balance > 0.01)
    .sort((a, b) => b.balance - a.balance); 

  const transactions: Transaction[] = [];
  let d = 0; 
  let c = 0; 

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const transferAmount = Math.min(Math.abs(debtor.balance), creditor.balance);

    transactions.push({
      from: debtor.member,
      to: creditor.member,
      amount: transferAmount,
    });

    debtor.balance += transferAmount;
    creditor.balance -= transferAmount;

    if (Math.abs(debtor.balance) < 0.01) d++;
    if (creditor.balance < 0.01) c++;
  }

  return transactions;
}