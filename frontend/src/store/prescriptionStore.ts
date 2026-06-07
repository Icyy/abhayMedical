import { create } from "zustand";
import type { Prescription } from "../types/prescription";

interface prescriptionStore {
  prescriptions: Prescription[];
  addPrescription: (prescription: Prescription) => void;
  setPrescription: (prescription: Prescription[]) => void;
  removePrescription: (prescriptionId: string) => void;
}

export const usePrescriptionStore = create<prescriptionStore>((set) => ({
  prescriptions: [],
  addPrescription: (prescription) =>
    set((state) => ({
      prescriptions: [...state.prescriptions, prescription],
    })),
  setPrescription: (prescriptions: Prescription[]) => set({ prescriptions }),
  removePrescription: (prescriptionId: string) => set((state) => ({
  prescriptions: state.prescriptions.filter((med) => med.prescriptionId !== prescriptionId)
}))
}));
