import { apiRequest } from './api'
import type { Medicine } from '../types/inventory'

interface MedicinesResponse {
  medicines: Medicine[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export const fetchMedicines = (params?: {
  page?: number;
  search?: string;
  category?: string;
  status?: string;
}): Promise<MedicinesResponse> => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.search) query.set('search', params.search)
  if (params?.category) query.set('category', params.category)
  if (params?.status) query.set('status', params.status)

  return apiRequest(`/medicines?${query.toString()}`)
}

export const createMedicine = (medicine: Omit<Medicine, 'id'>): Promise<Medicine> => {
  return apiRequest('/medicines', {
    method: 'POST',
    body: JSON.stringify(medicine),
  })
}

export const deleteMedicineById = (id: string): Promise<void> => {
  return apiRequest(`/medicines/${id}`, {
    method: 'DELETE',
  })
}

export const updateMedicineStatusById = (id: string, status: Medicine['status']): Promise<Medicine> => {
  return apiRequest(`/medicines/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}