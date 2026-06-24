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

interface PrescriptionsResponse {
  prescriptions: Prescription[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export const fetchPrescriptions = (params?: {
  page?: number
  search?: string
  status?: string
}): Promise<PrescriptionsResponse> => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.search) query.set('search', params.search)
  if (params?.status) query.set('status', params.status)
  return apiRequest(`/prescriptions?${query.toString()}`)
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