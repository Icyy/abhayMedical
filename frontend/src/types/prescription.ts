interface PrescriptionItem {
  id: string;
  medicineId: string;
  quantity: number;
  price: number;
  medicine: {
    id: string;
    name: string;
  };
}

export interface Prescription {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  doctorName: string;
  notes: string;
  discount: number;
  subTotal: number;
  total: number;
  status: 'PAID' | 'PENDING' | 'REJECTED';
  date: string;
  items: PrescriptionItem[];
}