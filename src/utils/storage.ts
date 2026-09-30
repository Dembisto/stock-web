import { Product, Sale, Expense } from '../types';

// Authentic generated images
import riceBagImg from '../assets/images/senegal_rice_bag_1790783608656.jpg';
import oilBottleImg from '../assets/images/senegal_oil_bottle_1790783618616.jpg';
import milkCanImg from '../assets/images/senegal_milk_can_1790783628450.jpg';
import soapBarImg from '../assets/images/senegal_soap_bar_1790783639174.jpg';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Riz Parfumé Brisé 25 kg',
    photoUrl: riceBagImg,
    barcode: 'SN-784012',
    stockQuantity: 18,
    costPrice: 15500,
    sellingPrice: 17500,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Huile Dinor 5 Litres',
    photoUrl: oilBottleImg,
    barcode: 'SN-612940',
    stockQuantity: 12,
    costPrice: 6200,
    sellingPrice: 7200,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Lait Bonnet Rouge 390g',
    photoUrl: milkCanImg,
    barcode: 'SN-902341',
    stockQuantity: 4,
    costPrice: 650,
    sellingPrice: 800,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Savon Madar Gros',
    photoUrl: soapBarImg,
    barcode: 'SN-443129',
    stockQuantity: 32,
    costPrice: 375,
    sellingPrice: 500,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    productId: 'prod-1',
    productName: 'Riz Parfumé Brisé (Sac 25 kg)',
    productPhotoUrl: riceBagImg,
    quantity: 1,
    sellingPrice: 17500,
    costPrice: 15500,
    totalAmount: 17500,
    margin: 2000,
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    cancelled: false,
  },
  {
    id: 'sale-2',
    productId: 'prod-3',
    productName: 'Lait Bonnet Rouge (Boîte 390g)',
    productPhotoUrl: milkCanImg,
    quantity: 2,
    sellingPrice: 800,
    costPrice: 650,
    totalAmount: 1600,
    margin: 300,
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    cancelled: false,
  },
  {
    id: 'sale-3',
    productId: 'prod-4',
    productName: 'Savon Madar Multiusage (Gros)',
    productPhotoUrl: soapBarImg,
    quantity: 3,
    sellingPrice: 500,
    costPrice: 375,
    totalAmount: 1500,
    margin: 375,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    cancelled: false,
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Recharge Compteur Woyofal (Électricité)',
    category: 'woyofal',
    amount: 5000,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'exp-2',
    title: 'Achat Rouleaux Sacs Plastiques Emballage',
    category: 'emballage',
    amount: 2000,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
];

const STORAGE_KEY_PRODUCTS = 'jaay_senegal_products_v1';
const STORAGE_KEY_SALES = 'jaay_senegal_sales_v1';
const STORAGE_KEY_EXPENSES = 'jaay_senegal_expenses_v1';

export function getStoredProducts(): Product[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error('Error loading products from localStorage', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products', e);
  }
}

export function getStoredSales(): Sale[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY_SALES);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error('Error loading sales', e);
  }
  return INITIAL_SALES;
}

export function saveStoredSales(sales: Sale[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
  } catch (e) {
    console.error('Error saving sales', e);
  }
}

export function getStoredExpenses(): Expense[] {
  try {
    const item = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error('Error loading expenses', e);
  }
  return INITIAL_EXPENSES;
}

export function saveStoredExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses', e);
  }
}

export function resetAllStorageData(): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(INITIAL_EXPENSES));
  } catch {
    //
  }
}
