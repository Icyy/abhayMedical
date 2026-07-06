import type { Medicine } from './inventory'

export type CreateMedicinePayload = Omit<Medicine, 'id' | 'stock' | 'status' | 'batches' | 'nearestExpiryDate' | 'expiringBatches'> & {
  batchNumber?: string
  manufacturingDate?: string
  expiryDate?: string
  purchasePrice?: number
  stockUnits?: number
}