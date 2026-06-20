import { apiRequest } from './api'
import type { PurchaseOrder } from '../types/supplier'

interface CreatePurchaseOrderPayload {
  supplierId: string;
  expectedDelivery?: string;
  notes?: string;
  items: { medicineName: string; quantity: number; pricePerUnit: number }[];
}

export const fetchPurchaseOrders = (): Promise<PurchaseOrder[]> => {
  return apiRequest('/purchase-orders')
}

export const createPurchaseOrder = (payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> => {
  return apiRequest('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const receivePurchaseOrderById = (id: string): Promise<PurchaseOrder> => {
  return apiRequest(`/purchase-orders/${id}/receive`, {
    method: 'PATCH',
  })
}

export const cancelPurchaseOrderById = (id: string): Promise<PurchaseOrder> => {
  return apiRequest(`/purchase-orders/${id}/cancel`, {
    method: 'PATCH',
  })
}