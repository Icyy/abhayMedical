import { apiRequest } from './api'
import type { Customer } from '../types/customer'

export const fetchCustomers = (): Promise<Customer[]> => {
  return apiRequest('/customers')
}

export const createCustomer = (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpend'>): Promise<Customer> => {
  return apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  })
}

export const deleteCustomerById = (id: string): Promise<void> => {
  return apiRequest(`/customers/${id}`, {
    method: 'DELETE',
  })
}

export const awardCustomerLoyaltyPoints = (phoneNumber: string, name: string, spendAmount: number): Promise<Customer> => {
  return apiRequest('/customers/loyalty', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, name, spendAmount }),
  })
}