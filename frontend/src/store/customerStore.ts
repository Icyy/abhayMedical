import { create } from "zustand";
import type { Customer } from "../types/customer";

interface CustomerStore {
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  setCustomers: (customers: Customer[]) => void;
  removeCustomer: (customerId: string) => void;
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
}));
