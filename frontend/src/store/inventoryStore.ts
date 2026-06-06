import { create } from 'zustand'
import type { Medicine } from '../types/inventory'

interface InventoryStore {
  medicines: Medicine[]
  addMedicine: (medicine: Medicine) => void
  setMedicines: (medicines: Medicine[]) => void
  
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  medicines: [],
  addMedicine: (medicine) => set((state) => ({
    medicines: [...state.medicines, medicine]
  })),
  setMedicines: (medicines: Medicine[]) => set({ medicines })
}))