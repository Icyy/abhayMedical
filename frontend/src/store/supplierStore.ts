import { create } from "zustand";
import type { Supplier, PurchaseOrder } from "../types/supplier";
import {
  fetchSuppliers,
  createSupplier,
  deleteSupplierById,
} from "../services/supplierService";
import {
  fetchPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrderById,
  cancelPurchaseOrderById,
} from "../services/purchaseOrderService";

interface CreatePurchaseOrderPayload {
  supplierId: string;
  expectedDelivery?: string;
  notes?: string;
  items: {
    medicineName: string;
    quantity: number;
    pricePerUnit: number;
    // Make these optional (?) so both simple orders and detailed bills can use this payload
    batchNumber?: string;
    sellingPrice?: number;
    gstPercent?: number;
    manufacturingDate?: string;
    expiryDate?: string;
  }[];
}

interface SupplierStore {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;
  loadSuppliers: () => Promise<void>;
  loadPurchaseOrders: () => Promise<void>;
  addSupplier: (supplier: {
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    gstNumber?: string;
  }) => Promise<void>;
  removeSupplier: (id: string) => Promise<void>;
  addPurchaseOrder: (payload: CreatePurchaseOrderPayload) => Promise<void>;
  receivePurchaseOrder: (id: string) => Promise<void>;
  cancelPurchaseOrder: (id: string) => Promise<void>;
}

export const useSupplierStore = create<SupplierStore>((set) => ({
  suppliers: [],
  purchaseOrders: [],
  isLoading: false,
  error: null,

  loadSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const suppliers = await fetchSuppliers();
      set({ suppliers, isLoading: false });
    } catch (err) {
      set({ error: "Failed to load suppliers", isLoading: false });
    }
  },

  loadPurchaseOrders: async () => {
    try {
      const purchaseOrders = await fetchPurchaseOrders();
      set({ purchaseOrders });
    } catch (err) {
      set({ error: "Failed to load purchase orders" });
    }
  },

  addSupplier: async (supplier) => {
    const newSupplier = await createSupplier(supplier);
    set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
  },

  removeSupplier: async (id) => {
    await deleteSupplierById(id);
    set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) }));
  },

  addPurchaseOrder: async (payload) => {
    const newOrder = await createPurchaseOrder(payload);
    set((state) => ({ purchaseOrders: [...state.purchaseOrders, newOrder] }));
  },

  receivePurchaseOrder: async (id) => {
    const updated = await receivePurchaseOrderById(id);
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((o) =>
        o.id === id ? updated : o,
      ),
    }));
  },

  cancelPurchaseOrder: async (id) => {
    const updated = await cancelPurchaseOrderById(id);
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((o) =>
        o.id === id ? updated : o,
      ),
    }));
  },
}));
