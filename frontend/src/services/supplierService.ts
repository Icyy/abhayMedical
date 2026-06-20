import { apiRequest } from './api'
import type { Supplier } from '../types/supplier'

export const fetchSuppliers = (): Promise<Supplier[]> => {
  return apiRequest('/suppliers')
}

export const createSupplier = (supplier: { name: string; contactPerson?: string; phone: string; email?: string; address?: string; gstNumber?: string }): Promise<Supplier> => {
  return apiRequest('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplier),
  })
}

export const deleteSupplierById = (id: string): Promise<void> => {
  return apiRequest(`/suppliers/${id}`, {
    method: 'DELETE',
  })
}

export const addSupplierMedicinePrice = (supplierId: string, medicineName: string, pricePerUnit: number) => {
  return apiRequest(`/suppliers/${supplierId}/medicines`, {
    method: 'POST',
    body: JSON.stringify({ medicineName, pricePerUnit }),
  })
}

export const comparePricesForMedicine = (medicineName: string) => {
  return apiRequest(`/suppliers/compare/${encodeURIComponent(medicineName)}`)
}