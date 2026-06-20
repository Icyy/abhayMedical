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
  prescriptions: Prescription[];
  isLoading: boolean;
  error: string | null;
  loadPrescriptions: () => Promise<void>;
  addPrescription: (payload: PrescriptionPayload) => Promise<void>;
  removePrescription: (id: string) => Promise<void>;
  updatePrescriptionStatus: (id: string, status: Prescription["status"]) => Promise<void>;
}

export const usePrescriptionStore = create<PrescriptionStore>((set) => ({
  prescriptions: [],
  isLoading: false,
  error: null,

  loadPrescriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const prescriptions = await fetchPrescriptions();
      set({ prescriptions, isLoading: false });
    } catch (err) {
      set({ error: "Failed to load prescriptions", isLoading: false });
    }
  },

  addPrescription: async (payload) => {
    const newPrescription = await createPrescription(payload);
    set((state) => ({ prescriptions: [...state.prescriptions, newPrescription] }));
  },

  removePrescription: async (id) => {
    await deletePrescriptionById(id);
    set((state) => ({ prescriptions: state.prescriptions.filter((p) => p.id !== id) }));
  },

  updatePrescriptionStatus: async (id, status) => {
    const updated = await updatePrescriptionStatusById(id, status);
    set((state) => ({
      prescriptions: state.prescriptions.map((p) => (p.id === id ? updated : p)),
    }));
  },
}));