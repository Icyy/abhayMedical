import { create } from "zustand";
import type { Prescription } from "../types/prescription";
import { fetchPrescriptions, createPrescription, updatePrescriptionStatusById, deletePrescriptionById } from "../services/prescriptionService";

interface PrescriptionPayload {
  customerPhone: string;
  customerName: string;
  doctorName: string;
  notes: string;
  discount: number;
  items: { medicineId: string; quantity: number; price: number }[];
}

interface PrescriptionStore {
  prescriptions: Prescription[]
  total: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  error: string | null
  loadPrescriptions: (params?: { page?: number; search?: string; status?: string }) => Promise<void>
  addPrescription: (payload: PrescriptionPayload) => Promise<void>
  removePrescription: (id: string) => Promise<void>
  updatePrescriptionStatus: (id: string, status: Prescription['status']) => Promise<void>
}

export const usePrescriptionStore = create<PrescriptionStore>((set) => ({
  prescriptions: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  loadPrescriptions: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetchPrescriptions(params)
      set({
        prescriptions: response.prescriptions,
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        isLoading: false
      })
    } catch (err) {
      set({ error: 'Failed to load prescriptions', isLoading: false })
    }
  },

  addPrescription: async (payload) => {
    const newPrescription = await createPrescription(payload)
    set((state) => ({
      prescriptions: [newPrescription, ...state.prescriptions],
      total: state.total + 1
    }))
  },

  removePrescription: async (id) => {
    await deletePrescriptionById(id)
    set((state) => ({
      prescriptions: state.prescriptions.filter((p) => p.id !== id),
      total: state.total - 1
    }))
  },

  updatePrescriptionStatus: async (id, status) => {
    const updated = await updatePrescriptionStatusById(id, status)
    set((state) => ({
      prescriptions: state.prescriptions.map((p) => p.id === id ? updated : p)
    }))
  },
}))