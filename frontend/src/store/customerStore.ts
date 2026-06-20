import { create } from "zustand";
import type { Customer } from "../types/customer";
import {
  fetchCustomers,
  createCustomer,
  deleteCustomerById,
  awardCustomerLoyaltyPoints,
} from "../services/customerService";

interface CustomerStore {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  loadCustomers: () => Promise<void>;
  addCustomer: (
    customer: Omit<Customer, "id" | "loyaltyPoints" | "totalSpend">,
  ) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  awardLoyaltyPoints: (
    phoneNumber: string,
    name: string,
    spendAmount: number,
  ) => Promise<void>;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  isLoading: false,
  error: null,

  loadCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const customers = await fetchCustomers();
      set({ customers, isLoading: false });
    } catch (err) {
      set({ error: "Failed to load customers", isLoading: false });
    }
  },

  addCustomer: async (customer) => {
    const newCustomer = await createCustomer(customer);
    set((state) => ({ customers: [...state.customers, newCustomer] }));
  },

  removeCustomer: async (id) => {
    await deleteCustomerById(id);
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    }));
  },

  awardLoyaltyPoints: async (phoneNumber, name, spendAmount) => {
    const updated = await awardCustomerLoyaltyPoints(
      phoneNumber,
      name,
      spendAmount,
    );
    set((state) => {
      const exists = state.customers.find(
        (c) => c.id === updated.id,
      );
      if (exists) {
        return {
          customers: state.customers.map((c) =>
            c.id === updated.id ? updated : c,
          ),
        };
      }
      return { customers: [...state.customers, updated] };
    });
  },
}));
