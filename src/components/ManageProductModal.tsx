import React, { useState, useEffect } from 'react';
import {
  X,
  Pencil,
  Check,
  Barcode,
  Trash2,
  Package,
  Plus,
} from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../utils/formatters';

interface ManageProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (updatedProduct: Product) => void;
  onOpenPrintLabel: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ManageProductModal: React.FC<ManageProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaveProduct,
  onOpenPrintLabel,
  onDeleteProduct,
}) => {
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [barcode, setBarcode] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number>(0);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSellingPrice(product.sellingPrice);
      setCostPrice(product.costPrice);
      setBarcode(product.barcode);
      setStockQuantity(product.stockQuantity);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleQuickAddStock = (amount: number) => {
    setStockQuantity((prev) => Math.max(0, (Number(prev) || 0) + amount));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const updatedProduct: Product = {
      ...product,
      name: name.trim() || product.name,
      sellingPrice: Number(sellingPrice) || product.sellingPrice,
      costPrice: Number(costPrice) || product.costPrice,
      barcode: barcode.trim() || product.barcode,
      stockQuantity: Math.max(0, Number(stockQuantity) || 0),
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(updatedProduct);
    onClose();
  };

  const margin = Number(sellingPrice || 0) - Number(costPrice || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto border border-neutral-300">
        {/* Header simple */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0066CC]/10 flex items-center justify-center text-[#0066CC]">
              <Pencil className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#1D1D1F] uppercase tracking-wide">
                Modifier l'article
              </h2>
              <p className="text-[11px] text-neutral-500 truncate max-w-[220px]">
                {product.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#1D1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aperçu produit */}
        <div className="flex items-center gap-3 my-3 p-2.5 bg-[#F7F8FA] rounded-xl border border-neutral-200">
          <div className="w-12 h-12 rounded-lg bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
            {product.photoUrl ? (
              <img
                src={product.photoUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-neutral-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-[#1D1D1F] truncate">{product.name}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Prix actuel : <strong className="text-[#0066CC] font-black">{formatFCFA(product.sellingPrice)}</strong>
            </p>
          </div>
        </div>

        {/* Formulaire direct sans onglets ni complications */}
        <form onSubmit={handleSave} className="space-y-3.5 flex-1">
          {/* 1. Prix de vente & Prix d'achat */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Prix de vente (FCFA)
              </label>
              <input
                type="number"
                min="0"
                step="25"
                value={sellingPrice || ''}
                onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 bg-white border-2 border-[#0066CC] rounded-xl font-black text-sm text-[#0066CC] focus:outline-none tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Prix d'achat (FCFA)
              </label>
              <input
                type="number"
                min="0"
                step="25"
                value={costPrice || ''}
                onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
                className="w-full h-11 px-3 bg-white border border-neutral-300 rounded-xl font-bold text-sm text-neutral-800 focus:border-[#0066CC] focus:outline-none tabular-nums"
                required
              />
            </div>
          </div>

          {/* Bénéfice net calculé */}
          <div className="p-2.5 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between text-xs">
            <span className="text-green-800 font-bold">Bénéfice par article :</span>
            <span className="font-black text-green-700 text-sm tabular-nums">
              +{formatFCFA(margin)}
            </span>
          </div>

          {/* 2. Stock en magasin + Arrivage rapide */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                Stock en magasin
              </label>
              <span className="text-xs text-neutral-500 font-medium">
                Articles disponibles
              </span>
            </div>

            {/* Saisie directe du stock */}
            <input
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-center text-3xl font-black text-[#1D1D1F] h-13 bg-white border-2 border-neutral-300 focus:border-[#0066CC] rounded-xl focus:outline-none tabular-nums"
              required
            />

            {/* Boutons d'arrivage rapide (+5, +10, +20...) */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-neutral-500 block mb-1">
                Arrivage grossiste (ajouter rapidement) :
              </span>
              <div className="flex gap-1.5">
                {[5, 10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAddStock(amt)}
                    className="flex-1 h-8 rounded-lg bg-white hover:bg-neutral-100 text-[#1D1D1F] text-xs font-bold transition-all border border-neutral-300 shadow-2xs active:scale-95"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Nom du produit */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Nom de l'article
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-neutral-300 rounded-xl font-bold text-xs sm:text-sm text-[#1D1D1F] focus:border-[#0066CC] focus:outline-none"
              required
            />
          </div>

          {/* 4. Code-barres */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Code-barres
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-neutral-300 rounded-xl font-mono font-bold text-xs text-[#1D1D1F] focus:border-[#0066CC] focus:outline-none"
            />
          </div>

          {/* Boutons utiles : Étiquette & Supprimer */}
          <div className="pt-2 border-t border-neutral-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPrintLabel(product);
              }}
              className="flex-1 h-10 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-[0.98] text-[#1D1D1F] font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-300 transition-all cursor-pointer shadow-2xs"
            >
              <Barcode className="w-4 h-4 text-neutral-700 shrink-0" />
              <span>Imprimer l'étiquette</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Supprimer définitivement "${product.name}" du magasin ?`)) {
                  onDeleteProduct(product.id);
                  onClose();
                }
              }}
              className="h-10 px-3 rounded-xl bg-red-50 hover:bg-red-100 active:scale-[0.98] text-[#DC2626] font-bold text-xs flex items-center justify-center gap-1.5 border border-red-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Supprimer</span>
            </button>
          </div>

          {/* Bouton Enregistrer */}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] active:scale-[0.98] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>ENREGISTRER</span>
          </button>
        </form>
      </div>
    </div>
  );
};
