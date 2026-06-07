import { create } from 'zustand'
import type { Customer } from '../types/customer'


interface CustomerStore {
  customers: Customer[]
  addCustomer: (customer: Customer) => void
  setCustomers: (customers: Customer[]) => void
  
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, customer]
  })),
  setCustomers: (customers: Customer[]) => set({ customers })
}))