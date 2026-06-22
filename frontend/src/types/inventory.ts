export interface Medicine {
  id: string;
  name: string;
  unit: string;
  manufacturingDate: Date;
  expiryDate: Date;
  price: number;
  batchNumber: string;
  stock: number;
  status: 'OK' | 'LOW' | 'CRITICAL';
  category: 'ALLOPATHIC' | 'AYURVEDIC' | 'HOMEOPATHIC' | 'VETERINARY' | 'COSMETIC' | 'SURGICAL' | 'OTHER';
  gstPercent: number;
}