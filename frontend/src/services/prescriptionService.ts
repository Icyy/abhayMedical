import { apiRequest } from './api'
import type { Prescription } from '../types/prescription'

interface CreatePrescriptionPayload {
  customerPhone: string
  customerName: string
  doctorName: string
  notes: string
  discount: number
  items: { medicineId: string; quantity: number; price: number }[]
}

export const fetchPrescriptions = (): Promise<Prescription[]> => {
  return apiRequest('/prescriptions')
}

export const createPrescription = (payload: CreatePrescriptionPayload): Promise<Prescription> => {
  return apiRequest('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const updatePrescriptionStatusById = (id: string, status: Prescription['status']): Promise<Prescription> => {
  return apiRequest(`/prescriptions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export const deletePrescriptionById = (id: string): Promise<void> => {
  return apiRequest(`/prescriptions/${id}`, {
    method: 'DELETE',
  })
}