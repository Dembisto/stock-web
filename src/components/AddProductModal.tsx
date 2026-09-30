import React, { useState } from 'react';
import { X, Plus, Camera, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { formatFCFA, generateBarcode } from '../utils/formatters';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [photoUrl, setPhotoUrl] = useState('');

  if (!isOpen) return null;

  const cost = Number(costPrice) || 0;
  const selling = Number(sellingPrice) || 0;
  const margin = selling > 0 && cost > 0 ? selling - cost : 0;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sellingPrice) return;

    onAddProduct({
      name: name.trim(),
      photoUrl: photoUrl.trim(),
      barcode: generateBarcode(),
      stockQuantity: Number(stockQuantity) || 0,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto border border-neutral-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div>
            <h2 className="text-sm font-black text-[#1D1D1F] uppercase tracking-wide">
              Nouveau produit
            </h2>
            <p className="text-xs text-neutral-500">
              Fiche article boutique
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#1D1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 my-3">
          {/* Photo */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
              Photo produit (facultatif)
            </label>
            <div className="flex items-center gap-3">
              {photoUrl ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                  <img
                    src={photoUrl}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-1 right-1 w-5 h-5 rounded-md bg-[#1D1D1F] text-white flex items-center justify-center"
                    title="Supprimer la photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex-1 h-12 rounded-xl bg-[#F7F8FA] hover:bg-neutral-100 border border-dashed border-neutral-300 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4 text-[#0066CC]" />
                  <span className="text-xs font-semibold text-neutral-600">
                    Prendre une photo ou importer
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Nom de l'article *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Sac de riz 25kg, Huile 5L, Savon..."
              className="w-full h-11 px-3 bg-white border border-neutral-300 rounded-xl text-sm font-semibold text-[#1D1D1F] focus:border-[#0066CC] focus:outline-none"
            />
          </div>

          {/* Prix d'achat & Prix de vente */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Prix d'achat grossiste
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="ex: 15000"
                  className="w-full h-11 pl-3 pr-10 bg-white border border-neutral-300 rounded-xl text-sm font-bold text-[#1D1D1F] focus:border-[#0066CC] focus:outline-none tabular-nums"
                />
                <span className="absolute right-3 top-3 text-xs text-neutral-400 font-bold">
                  FCFA
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                Prix de vente client *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="ex: 17500"
                  className="w-full h-11 pl-3 pr-10 bg-white border-2 border-[#0066CC] rounded-xl text-sm font-black text-[#1D1D1F] focus:outline-none tabular-nums"
                />
                <span className="absolute right-3 top-3 text-xs text-[#0066CC] font-bold">
                  FCFA
                </span>
              </div>
            </div>
          </div>

          {margin > 0 && (
            <div className="p-2.5 bg-[#F7F8FA] border border-neutral-200 rounded-xl flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-600">Bénéfice prévu par article :</span>
              <span className="text-[#15803D] font-black tabular-nums">+{formatFCFA(margin)}</span>
            </div>
          )}

          {/* Stock initial */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Quantité initiale disponible
            </label>
            <input
              type="number"
              min="0"
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              className="w-full h-11 px-3 bg-white border border-neutral-300 rounded-xl text-sm font-bold text-[#1D1D1F] focus:border-[#0066CC] focus:outline-none tabular-nums"
            />
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] active:translate-y-px text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>AJOUTER LE PRODUIT</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
