import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Trip, Member, Expense } from '@/lib/types';

interface TripStore {
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  updateTrip: (tripId: string, data: Partial<Trip>) => void;
  addMember: (tripId: string, member: Member) => void;
  deleteMember: (tripId: string, memberId: string) => void;
  addExpense: (tripId: string, expense: Expense) => void;
  updateExpense: (tripId: string, expenseId: string, updatedExpense: Expense) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  toggleExpenseSettled: (tripId: string, expenseId: string, memberId: string) => void; // added this
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      trips: [],
      
      addTrip: (trip) => set((state) => ({ trips: [...state.trips, trip] })),
      deleteTrip: (tripId) => set((state) => ({ trips: state.trips.filter(t => t.id !== tripId) })),
      updateTrip: (tripId, data) => set((state) => ({
        trips: state.trips.map(trip => trip.id === tripId ? { ...trip, ...data } : trip)
      })),
      
      addMember: (tripId, member) => set((state) => ({
        trips: state.trips.map(trip => trip.id === tripId ? { ...trip, members: [...trip.members, member] } : trip)
      })),
      
      deleteMember: (tripId, memberId) => set((state) => ({
        trips: state.trips.map(trip => trip.id === tripId ? { ...trip, members: trip.members.filter(m => m.id !== memberId) } : trip)
      })),
      
      addExpense: (tripId, expense) => set((state) => ({
        trips: state.trips.map(trip => trip.id === tripId ? { ...trip, expenses: [...trip.expenses, expense] } : trip)
      })),
      
      updateExpense: (tripId, expenseId, updatedExpense) => set((state) => ({
        trips: state.trips.map(trip => trip.id === tripId ? { ...trip, expenses: trip.expenses.map(e => e.id === expenseId ? updatedExpense : e) } : trip)
      })),
      
      deleteExpense: (tripId, expenseId) => set((state) => ({
        trips: state.trips.map(trip => trip.id === tripId ? { ...trip, expenses: trip.expenses.filter(e => e.id !== expenseId) } : trip)
      })),

      // the new function to mark items as paid
      toggleExpenseSettled: (tripId, expenseId, memberId) => set((state) => ({
        trips: state.trips.map(trip => 
          trip.id === tripId ? {
            ...trip,
            expenses: trip.expenses.map(exp => {
              if (exp.id === expenseId) {
                const currentSettled = exp.settledShares || {};
                return {
                  ...exp,
                  settledShares: { ...currentSettled, [memberId]: !currentSettled[memberId] }
                };
              }
              return exp;
            })
          } : trip
        )
      })),
      
    }),
    {
      name: 'bills-app-storage',
    }
  )
);