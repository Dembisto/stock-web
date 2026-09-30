import React, { useState } from 'react';
import { Minus, Plus, Check, X, AlertTriangle, Package } from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../utils/formatters';

interface SaleModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSale: (product: Product, quantity: number, paymentMethod?: 'especes' | 'wave') => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirmSale,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const totalAmount = quantity * product.sellingPrice;
  const unitProfit = product.sellingPrice - product.costPrice;
  const totalProfit = unitProfit * quantity;
  const isOutOfStock = product.stockQuantity <= 0;
  const isExceedingStock = quantity > product.stockQuantity;

  const handleIncrement = () => {
    if (quantity < product.stockQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleConfirm = () => {
    if (quantity <= 0 || isExceedingStock) return;
    onConfirmSale(product, quantity, 'especes');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto border border-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
          <span className="text-xs font-black tracking-wider text-[#1D1D1F] uppercase">
            Enregistrement Vente
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product row */}
        <div className="flex items-center gap-3.5 my-3 p-3 bg-[#F7F8FA] border border-neutral-200 rounded-xl">
          <div className="w-14 h-14 rounded-lg bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
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
            <h2 className="text-sm font-bold text-[#1D1D1F] truncate">
              {product.name}
            </h2>
            <div className="mt-0.5 text-xs text-neutral-500 font-medium">
              Prix unitaire : <span className="font-bold text-[#1D1D1F]">{formatFCFA(product.sellingPrice)}</span>
            </div>
            <div className="text-[11px] text-neutral-400">
              Stock dispo : <strong className="text-neutral-700">{product.stockQuantity}</strong>
            </div>
          </div>
        </div>

        {isOutOfStock ? (
          <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
            <AlertTriangle className="w-6 h-6 text-[#DC2626] mx-auto mb-1.5" />
            <p className="text-xs font-bold text-red-900 uppercase tracking-wide">Produit épuisé</p>
            <p className="text-xs text-red-700 mt-1">
              Faites un arrivage dans l’onglet Stock pour en rajouter.
            </p>
          </div>
        ) : (
          <>
            {/* Quantity Stepper: Mechanical Retail Keypad Feel */}
            <div className="my-2">
              <label className="block text-center text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Quantité à encaisser
              </label>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-14 h-12 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-300 text-[#1D1D1F] flex items-center justify-center text-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="w-24 h-12 rounded-xl bg-[#F7F8FA] border border-neutral-300 flex items-center justify-center">
                  <span className="text-2xl font-black text-[#1D1D1F] tabular-nums">
                    {quantity}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stockQuantity}
                  className="w-14 h-12 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-300 text-[#1D1D1F] flex items-center justify-center text-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Numerical keys */}
              {product.stockQuantity >= 2 && (
                <div className="flex justify-center gap-1.5 mt-2.5">
                  {[1, 2, 3, 5, 10].filter((n) => n <= product.stockQuantity).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuantity(n)}
                      className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                        quantity === n
                          ? 'bg-[#1D1D1F] text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] border border-neutral-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Total Display: Big Register Readout */}
            <div className="my-2.5 p-3.5 bg-[#F7F8FA] border border-neutral-300 rounded-xl text-center">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Total à percevoir
              </span>
              <span className="text-3xl font-black text-[#1D1D1F] tabular-nums block mt-0.5 tracking-tight">
                {formatFCFA(totalAmount)}
              </span>
              {totalProfit > 0 && (
                <div className="mt-1 text-xs font-bold text-[#15803D] tabular-nums">
                  Bénéfice net calculé : +{formatFCFA(totalProfit)}
                </div>
              )}
            </div>

            {/* Primary Action Button: Architectural, Solid #0066CC */}
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full h-13 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 text-white bg-[#0066CC] hover:bg-[#0052A3] active:translate-y-px transition-all shadow-sm"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>ENREGISTRER LA VENTE</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-9 rounded-lg text-neutral-500 hover:text-[#1D1D1F] hover:bg-neutral-100 font-semibold text-xs transition-colors"
              >
                Annuler
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
