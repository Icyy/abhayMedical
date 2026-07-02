export interface MedicineBatch {
  id: string
  medicineId: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
  purchasePrice: number
  stockUnits: number
  supplierId: string | null
  createdAt: string
}

export interface Medicine {
  id: string
  name: string
  unit: string
  packType: string
  unitsPerPack: number
  category: 'ALLOPATHIC' | 'AYURVEDIC' | 'HOMEOPATHIC' | 'VETERINARY' | 'SURGICAL' | 'COSMETIC' | 'PERSONAL_CARE' | 'FOOD_SUPPLEMENT' | 'BABY_CARE' | 'GENERAL_STORE' | 'OTHER'
  gstPercent: number
  mrp: number
  stock: number // computed from batches
  status: 'OK' | 'LOW' | 'CRITICAL' // computed
  batches: MedicineBatch[]
  nearestExpiryDate: string | null
  expiringBatches: number
}
