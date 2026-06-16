import { create } from "zustand";
import type { Customer } from "../types/customer";

interface CustomerStore {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  setCustomers: (customers: Customer[]) => void;
  removeCustomer: (customerId: string) => void;
  awardLoyaltyPoints: (phoneNumber: string, name: string, spendAmount: number)=>void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  addCustomer: (customer) =>
    set((state) => ({
      customers: [...state.customers, customer],
    })),
  setCustomers: (customers: Customer[]) => set({ customers }),
  removeCustomer: (customerId: string) =>
    set((state) => ({
      customers: state.customers.filter(
        (cust) => cust.customerId !== customerId,
      ),
    })),
  awardLoyaltyPoints: (
    phoneNumber: string,
    name: string,
    spendAmount: number,
  ) =>
    set((state) => {
      const existingCustomer = state.customers.find(
        (c) => c.phoneNumber === phoneNumber,
      );
      const pointsEarned = Math.floor(spendAmount / 100);

      if (existingCustomer) {
        return {
          customers: state.customers.map((c) =>
            c.phoneNumber === phoneNumber
              ? {
                  ...c,
                  loyaltyPoints: c.loyaltyPoints + pointsEarned,
                  totalSpend: c.totalSpend + spendAmount,
                }
              : c,
          ),
        };
      }

      const newCustomer: Customer = {
        customerId: `CX${Date.now()}`,
        name,
        phoneNumber,
        email: "",
        notes: "",
        loyaltyPoints: pointsEarned,
        totalSpend: spendAmount,
      };

      return { customers: [...state.customers, newCustomer] };
    }),
}));
