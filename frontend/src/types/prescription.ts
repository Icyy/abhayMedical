interface PrescriptionItem {
  id: string
  medicineId: string
  quantity: number
  pricePerUnit: number 
  gstPercent: number
  sellAsPackOf: number
  medicine: {
    id: string
    name: string
    mrp: number
    unitsPerPack: number
    packType: string
  }
}
export interface Prescription {
  id: string;
  customerId: string;
  customer: { id: string; name: string; phoneNumber: string };
  doctorName: string;
  notes: string;
  discount: number;
  subTotal: number;
  gstAmount: number;
  total: number;
  status: "PAID" | "PENDING" | "REJECTED";
  date: string;
  items: PrescriptionItem[];
}
