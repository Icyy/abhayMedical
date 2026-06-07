import { create } from 'zustand'
import type { Medicine } from '../types/inventory'

const mockMedicines: Medicine[] = [
  {
    name: "Paracetamol 500mg",
    unit: "strips",
    stock: 12,
    price: 25,
    batchNumber: "BX4821",
    manufacturingDate: new Date("2024-01-01"),
    expiryDate: new Date("2026-01-01"),
    status: "critical",
  },
  {
    name: "Azithromycin 250mg",
    unit: "strips",
    stock: 5,
    price: 85,
    batchNumber: "AZ1092",
    manufacturingDate: new Date("2024-03-01"),
    expiryDate: new Date("2026-03-01"),
    status: "critical",
  },
  {
    name: "Paracetamol test 500mg",
    unit: "capsules",
    stock: 12,
    price: 25,
    batchNumber: "BX482221",
    manufacturingDate: new Date("2024-01-01"),
    expiryDate: new Date("2026-01-01"),
    status: "ok",
  },
    {
    name: "Paracetamol test2 500mg",
    unit: "capsules",
    stock: 8,
    price: 25,
    batchNumber: "BX4823321",
    manufacturingDate: new Date("2024-01-01"),
    expiryDate: new Date("2026-01-01"),
    status: "low",
  },
];


interface InventoryStore {
  medicines: Medicine[]
  addMedicine: (medicine: Medicine) => void
  setMedicines: (medicines: Medicine[]) => void
  removeMedicine: (batchNumber: string) => void
  
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  medicines: mockMedicines,
  addMedicine: (medicine) => set((state) => ({
    medicines: [...state.medicines, medicine]
  })),
  setMedicines: (medicines: Medicine[]) => set({ medicines }),
  removeMedicine: (batchNumber: string) => set((state) => ({
  medicines: state.medicines.filter((med) => med.batchNumber !== batchNumber)
}))
}))