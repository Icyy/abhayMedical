import { create } from "zustand";
import type { Medicine, MedicinePayload } from "../types/inventory";
import {
  fetchMedicines,
  createMedicine,
  deleteMedicineById,
  updateMedicineStatusById,
} from "../services/medicineService";


interface InventoryStore {
  medicines: Medicine[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  loadMedicines: (params?: {
    page?: number;
    search?: string;
    category?: string;
    status?: string;
  }) => Promise<void>;
  addMedicine: (medicine: MedicinePayload) => Promise<void>;
  removeMedicine: (id: string) => Promise<void>;
  updateMedicineStatus: (
    id: string,
    status: Medicine["status"],
  ) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  medicines: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  loadMedicines: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchMedicines(params);
      set({
        medicines: response.medicines,
        total: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({ error: "Failed to load medicines", isLoading: false });
    }
  },

  addMedicine: async (medicine: MedicinePayload) => {
    const newMedicine = await createMedicine(medicine);
    set((state) => ({
      medicines: [newMedicine, ...state.medicines],
      total: state.total + 1,
    }));
  },

  removeMedicine: async (id) => {
    await deleteMedicineById(id);
    set((state) => ({
      medicines: state.medicines.filter((med) => med.id !== id),
      total: state.total - 1,
    }));
  },

  updateMedicineStatus: async (id, status) => {
    const updated = await updateMedicineStatusById(id, status);
    set((state) => ({
      medicines: state.medicines.map((med) => (med.id === id ? updated : med)),
    }));
  },
}));
