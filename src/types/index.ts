export interface Product {
  id: string;
  name: string;
  photoUrl: string;
  barcode: string;
  stockQuantity: number;
  costPrice: number; // Prix d'achat en FCFA
  sellingPrice: number; // Prix de vente en FCFA
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  productPhotoUrl: string;
  quantity: number;
  sellingPrice: number; // Prix unitaire
  costPrice: number; // Coût unitaire d'achat
  totalAmount: number; // quantity * sellingPrice
  margin: number; // totalAmount - (costPrice * quantity)
  paymentMethod?: 'especes' | 'wave';
  timestamp: string;
  cancelled: boolean;
  cancelledAt?: string;
}

export interface RestockOrder {
  id: string;
  productId: string;
  productName: string;
  quantityAdded: number;
  unitCost: number;
  totalCost: number;
  timestamp: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'woyofal' | 'loyer' | 'transport' | 'emballage' | 'salaire' | 'autre';
  amount: number;
  date: string;
}

export type TabType = 'boutique' | 'benefices' | 'historique' | 'caisse' | 'stock';
