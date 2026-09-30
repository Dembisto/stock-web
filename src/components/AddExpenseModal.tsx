import React, { useState } from 'react';
import { X, Receipt, Zap, Home, Truck, ShoppingBag, Plus } from 'lucide-react';
import { Expense } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
}

const CATEGORIES = [
  { id: 'woyofal' as const, label: 'Woyofal / Électricité', icon: Zap },
  { id: 'loyer' as const, label: 'Loyer boutique', icon: Home },
  { id: 'transport' as const, label: 'Transport / Livraison', icon: Truck },
  { id: 'emballage' as const, label: 'Sacs & Emballage', icon: ShoppingBag },
  { id: 'autre' as const, label: 'Autre charge', icon: Receipt },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [category, setCategory] = useState<Expense['category']>('woyofal');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const selectedCat = CATEGORIES.find((c) => c.id === category);
    const finalTitle = title.trim() || selectedCat?.label || 'Dépense courante';

    onAddExpense({
      title: finalTitle,
      category,
      amount: Number(amount),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto border border-neutral-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#DC2626]" />
            <h2 className="text-sm font-black text-[#1D1D1F] uppercase tracking-wide">
              Nouvelle dépense boutique
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#1D1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 my-3">
          {/* Categories Grid: Structured Rectangular Tiles */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
              Catégorie de charge
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (!title) setTitle(cat.label);
                    }}
                    className={`h-11 px-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-[#1D1D1F] bg-[#1D1D1F] text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
              Montant dépensé *
            </label>
            <div className="relative">
              <input
                type="number"
                min="100"
                step="50"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="5000"
                className="w-full h-14 text-center text-3xl font-black text-[#DC2626] bg-white border-2 border-neutral-300 rounded-xl focus:border-[#DC2626] focus:outline-none tabular-nums"
              />
              <span className="absolute right-4 top-4 text-xs font-bold text-neutral-400">
                FCFA
              </span>
            </div>

            {/* Quick keys */}
            <div className="flex gap-1.5 mt-2">
              {[1000, 2000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className="flex-1 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-[#1D1D1F] border border-neutral-200"
                >
                  {amt} F
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">
              Libellé / Note (facultatif)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Rechargement Woyofal, transport sacs..."
              className="w-full h-11 px-3 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-[#1D1D1F] focus:border-[#0066CC] focus:outline-none"
            />
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#DC2626] hover:bg-red-700 active:translate-y-px text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ENREGISTRER LA DÉPENSE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
