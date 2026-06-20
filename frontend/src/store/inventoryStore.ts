import { create } from 'zustand'
import type { Medicine } from '../types/inventory'
import { fetchMedicines, createMedicine, deleteMedicineById, updateMedicineStatusById } from '../services/medicineService'

interface InventoryStore {
  medicines: Medicine[]
  isLoading: boolean
  error: string | null
  loadMedicines: () => Promise<void>
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>
  removeMedicine: (id: string) => Promise<void>
  updateMedicineStatus: (id: string, status: Medicine['status']) => Promise<void>
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  medicines: [],
  isLoading: false,
  error: null,

  loadMedicines: async () => {
    set({ isLoading: true, error: null })
    try {
      const medicines = await fetchMedicines()
      set({ medicines, isLoading: false })
    } catch (err) {
      set({ error: 'Failed to load medicines', isLoading: false })
    }
  },

  addMedicine: async (medicine) => {
    const newMedicine = await createMedicine(medicine)
    set((state) => ({ medicines: [...state.medicines, newMedicine] }))
  },

  removeMedicine: async (id) => {
    await deleteMedicineById(id)
    set((state) => ({ medicines: state.medicines.filter((med) => med.id !== id) }))
  },

  updateMedicineStatus: async (id, status) => {
    const updated = await updateMedicineStatusById(id, status)
    set((state) => ({
      medicines: state.medicines.map((med) => (med.id === id ? updated : med))
    }))
  },
}))