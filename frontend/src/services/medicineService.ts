import { apiRequest } from './api'
import type { Medicine } from '../types/inventory'

export const fetchMedicines = (): Promise<Medicine[]> => {
  return apiRequest('/medicines')
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