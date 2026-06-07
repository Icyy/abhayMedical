export interface PrescribedMedicine {
    quantity: number,
    name: string
}


export interface Prescription {
  name: string;
  phoneNumber: string;
  medicines: Array<PrescribedMedicine>;
  subTotal: number;
  total: number;
  discount: number;
  prescriptionId: string; 
  status: 'paid' | 'pending' | 'rejected'
  notes: string
  doctorName: string
  date: Date
}