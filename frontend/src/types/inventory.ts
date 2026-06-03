export interface Medicine {
  name: string;
  unit: string;
  manufacturingDate: Date;
  expiryDate: Date;
  price: number;
  batchNumber: string;
  stock: number; 
  status: 'ok' | 'low' | 'critical'
}