import { useState, useEffect } from 'react';
import { Product, Sale, Expense, TabType } from './types';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredSales,
  saveStoredSales,
  getStoredExpenses,
  saveStoredExpenses,
  resetAllStorageData,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
} from './utils/storage';
import { soundEffects } from './utils/audioGuide';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BoutiqueView } from './views/BoutiqueView';
import { ProfitsView } from './views/ProfitsView';
import { HistoryView } from './views/HistoryView';

import { SaleModal } from './components/SaleModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ManageProductModal } from './components/ManageProductModal';
import { PrintLabelModal } from './components/PrintLabelModal';
import { AddProductModal } from './components/AddProductModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { UndoToast } from './components/UndoToast';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('boutique');
  const [shopName, setShopName] = useState<string>(() => {
    return localStorage.getItem('jaay_shop_name') || 'Boutique Touba Sandaga';
  });

  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [sales, setSales] = useState<Sale[]>(getStoredSales);
  const [expenses, setExpenses] = useState<Expense[]>(getStoredExpenses);

  // Modals state
  const [saleModalProduct, setSaleModalProduct] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manageProduct, setManageProduct] = useState<Product | null>(null);
  const [printLabelProduct, setPrintLabelProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Instant Undo Toast
  const [lastSaleToast, setLastSaleToast] = useState<Sale | null>(null);

  // Sync state to local storage
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredSales(sales);
  }, [sales]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('jaay_shop_name', shopName);
  }, [shopName]);

  // SALE FLOW
  const handleSelectProductToSell = (product: Product) => {
    setSaleModalProduct(product);
  };

  const handleConfirmSale = (
    product: Product,
    quantity: number,
    paymentMethod: 'especes' | 'wave' = 'especes'
  ) => {
    // 1. Decrement stock
    const updatedProducts = products.map((p) => {
      if (p.id === product.id) {
        return {
          ...p,
          stockQuantity: Math.max(0, p.stockQuantity - quantity),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    setProducts(updatedProducts);

    // 2. Record sale
    const totalAmount = quantity * product.sellingPrice;
    const margin = totalAmount - quantity * product.costPrice;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productPhotoUrl: product.photoUrl,
      quantity,
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      totalAmount,
      margin,
      paymentMethod,
      timestamp: new Date().toISOString(),
      cancelled: false,
    };

    setSales((prev) => [newSale, ...prev]);

    // 3. Tactile sound feedback
    soundEffects.playSuccess();

    // 4. Show instant undo toast
    setLastSaleToast(newSale);
  };

  // CANCEL SALE FLOW
  const handleCancelSale = (saleId: string) => {
    const saleToCancel = sales.find((s) => s.id === saleId);
    if (!saleToCancel || saleToCancel.cancelled) return;

    // 1. Mark sale as cancelled
    const updatedSales = sales.map((s) => {
      if (s.id === saleId) {
        return { ...s, cancelled: true, cancelledAt: new Date().toISOString() };
      }
      return s;
    });
    setSales(updatedSales);

    // 2. Restore product stock
    const updatedProducts = products.map((p) => {
      if (p.id === saleToCancel.productId) {
        return {
          ...p,
          stockQuantity: p.stockQuantity + saleToCancel.quantity,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    setProducts(updatedProducts);

    soundEffects.playCancel();
  };

  // MANAGE & UPDATE PRODUCT (PRICE, RESTOCK, LOSS, INVENTORY)
  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    soundEffects.playSuccess();
  };

  // RESTOCK / ARRIVAGE FLOW
  const handleConfirmRestock = (
    productId: string,
    quantityToAdd: number,
    updatedCostPrice?: number
  ) => {
    const updatedProducts = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          stockQuantity: p.stockQuantity + quantityToAdd,
          costPrice: updatedCostPrice !== undefined ? updatedCostPrice : p.costPrice,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    setProducts(updatedProducts);

    soundEffects.playSuccess();
  };

  // ADD NEW PRODUCT FLOW
  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    soundEffects.playSuccess();
  };

  // DELETE PRODUCT FLOW
  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // ADD EXPENSE FLOW
  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    soundEffects.playSuccess();
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const handleResetData = () => {
    resetAllStorageData();
    setProducts(INITIAL_PRODUCTS);
    setSales(INITIAL_SALES);
    setExpenses(INITIAL_EXPENSES);
  };

  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 3).length;

  return (
    <div className="h-[100dvh] w-full bg-[#F7F8FA] text-[#1D1D1F] flex flex-col overflow-hidden antialiased select-none">
      {/* Undo Banner if a sale was just made */}
      <UndoToast
        sale={lastSaleToast}
        onUndo={handleCancelSale}
        onDismiss={() => setLastSaleToast(null)}
      />

      {/* Fixed Native Top App Bar */}
      <Header
        shopName={shopName}
        onEditShopName={setShopName}
        onResetData={handleResetData}
      />

      {/* Main Content Area (Fluid inside mobile container, no web scrollbars) */}
      <main className="flex-1 w-full max-w-lg mx-auto overflow-y-auto no-scrollbar px-3 pt-2.5 pb-20">
        {(currentTab === 'boutique' || currentTab === 'caisse' || currentTab === 'stock') && (
          <BoutiqueView
            products={products}
            onSelectProductToSell={handleSelectProductToSell}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
            onOpenPrintLabel={(prod) => setPrintLabelProduct(prod)}
            onOpenManageProduct={(prod) => setManageProduct(prod)}
          />
        )}

        {currentTab === 'benefices' && (
          <ProfitsView
            products={products}
            sales={sales}
            expenses={expenses}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {currentTab === 'historique' && (
          <HistoryView
            sales={sales}
            onCancelSale={handleCancelSale}
          />
        )}
      </main>

      {/* Fixed Native Bottom App Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lowStockCount={lowStockCount}
      />

      {/* Modals & Dialogs */}
      <SaleModal
        product={saleModalProduct}
        isOpen={Boolean(saleModalProduct)}
        onClose={() => setSaleModalProduct(null)}
        onConfirmSale={handleConfirmSale}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        onProductFound={(product) => {
          setIsScannerOpen(false);
          setSaleModalProduct(product);
        }}
      />

      <ManageProductModal
        product={manageProduct}
        isOpen={Boolean(manageProduct)}
        onClose={() => setManageProduct(null)}
        onSaveProduct={handleSaveProduct}
        onOpenPrintLabel={(prod) => setPrintLabelProduct(prod)}
        onDeleteProduct={handleDeleteProduct}
      />

      <PrintLabelModal
        product={printLabelProduct}
        isOpen={Boolean(printLabelProduct)}
        onClose={() => setPrintLabelProduct(null)}
        shopName={shopName}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
}
export default App;
