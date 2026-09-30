import React, { useState } from 'react';
import { Plus, X, PackagePlus } from 'lucide-react';
import { Product } from '../types';

interface ArrivageModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRestock: (productId: string, quantityToAdd: number, updatedCostPrice?: number) => void;
}

export const ArrivageModal: React.FC<ArrivageModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirmRestock,
}) => {
  const [quantity, setQuantity] = useState<number>(10);
  const [costPrice, setCostPrice] = useState<number>(product?.costPrice || 0);

  if (!isOpen || !product) return null;

  const currentStock = product.stockQuantity;
  const newStock = currentStock + Number(quantity || 0);

  const handleQuickAdd = (amount: number) => {
    setQuantity((prev) => (Number(prev) || 0) + amount);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    onConfirmRestock(product.id, Number(quantity), Number(costPrice) || product.costPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto border border-neutral-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-[#0066CC]" />
            <h2 className="text-sm font-black text-[#1D1D1F] uppercase tracking-wide">
              Arrivage marchandise
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#1D1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product preview */}
        <div className="flex items-center gap-3 my-3 p-3 bg-[#F7F8FA] rounded-xl border border-neutral-200">
          <div className="w-12 h-12 rounded-lg bg-white border border-neutral-200 overflow-hidden shrink-0">
            <img
              src={product.photoUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-[#1D1D1F] truncate">{product.name}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Stock actuel : <strong className="text-[#1D1D1F]">{currentStock}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="space-y-3.5">
          {/* Quantity added */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
              Quantité reçue
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity || ''}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full text-center text-3xl font-black text-[#1D1D1F] h-14 bg-white border-2 border-[#1D1D1F] rounded-xl focus:outline-none tabular-nums"
              required
            />

            {/* Quick keys */}
            <div className="flex gap-1.5 mt-2">
              {[5, 10, 20, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className="flex-1 h-9 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] text-xs font-bold transition-all border border-neutral-200"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* New stock preview */}
          <div className="p-3 bg-[#F7F8FA] border border-neutral-200 rounded-xl flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-600">Nouveau total en stock :</span>
            <span className="text-base text-[#1D1D1F] font-black tabular-nums">{newStock}</span>
          </div>

          {/* Cost update */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">
              Prix d'achat grossiste (si modifié)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={costPrice || product.costPrice}
                onChange={(e) => setCostPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full h-11 px-3 bg-white border border-neutral-300 rounded-xl text-sm font-semibold text-[#1D1D1F] focus:border-[#0066CC] focus:outline-none"
              />
              <span className="absolute right-3 top-3 text-xs text-neutral-400 font-semibold">
                FCFA
              </span>
            </div>
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] active:translate-y-px text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>VALIDER L'ARRIVAGE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
