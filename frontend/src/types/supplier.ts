export interface Supplier {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  discountPercent: number;
  medicines: SupplierMedicine[];
  purchaseOrders: PurchaseOrder[];
}
export interface SupplierMedicine {
  id: string;
  supplierId: string;
  medicineName: string;
  pricePerUnit: number;
}

export interface PurchaseOrderItem {
  id: string
  medicineName: string
  batchNumber: string | null
  manufacturingDate: string | null
  expiryDate: string | null
  quantity: number
  pricePerUnit: number
  sellingPrice: number | null
  gstPercent: number | null
  totalPrice: number
}
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  totalCost: number;
  orderDate: string;
  expectedDelivery: string | null;
  receivedDate: string | null;
  notes: string | null;
  items: PurchaseOrderItem[];
}