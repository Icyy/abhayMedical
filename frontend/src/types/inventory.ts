export interface Medicine {
  id: string;
  name: string;
  unit: string;
  manufacturingDate: Date;
  expiryDate: Date;
  price: number;
  purchasePrice: number;
  batchNumber: string;
  stock: number;
  status: "OK" | "LOW" | "CRITICAL";
  category:
    | "ALLOPATHIC"
    | "AYURVEDIC"
    | "HOMEOPATHIC"
    | "VETERINARY"
    | "SURGICAL"
    | "COSMETIC"
    | "PERSONAL_CARE"
    | "FOOD_SUPPLEMENT"
    | "BABY_CARE"
    | "GENERAL_STORE"
    | "OTHER";
  gstPercent: number;
}
