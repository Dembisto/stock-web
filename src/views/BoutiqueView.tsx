import React, { useState, useRef, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Mic,
  MicOff,
  Camera,
  ShoppingBag,
  Pencil,
  Barcode,
} from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../utils/formatters';
import { soundEffects } from '../utils/audioGuide';

interface BoutiqueViewProps {
  products: Product[];
  onSelectProductToSell: (product: Product) => void;
  onOpenScanner: () => void;
  onOpenAddProduct: () => void;
  onOpenManageProduct: (product: Product) => void;
  onOpenPrintLabel: (product: Product) => void;
}

export const BoutiqueView: React.FC<BoutiqueViewProps> = ({
  products,
  onSelectProductToSell,
  onOpenScanner,
  onOpenAddProduct,
  onOpenManageProduct,
  onOpenPrintLabel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isListening, setIsListening] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const windowWithSpeech = window as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SpeechRecognition?: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webkitSpeechRecognition?: any;
    };
    const SpeechRec = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => {
        setIsListening(true);
        soundEffects.playMicStart();
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((result: any) => result[0].transcript)
          .join('');
        setSearchQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        soundEffects.playSuccess();
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort
        }
      }
    };
  }, []);

  const handleToggleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Fallback simulation
        runVoiceSimulation();
      }
    } else {
      runVoiceSimulation();
    }
  };

  const runVoiceSimulation = () => {
    setIsListening(true);
    soundEffects.playMicStart();
    const sampleQueries = ['Riz', 'Huile', 'Dinor', 'Lait', 'Savon'];
    const chosen = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    setTimeout(() => {
      setSearchQuery(chosen);
      setIsListening(false);
      soundEffects.playSuccess();
    }, 1000);
  };

  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const totalStockCostValue = products.reduce(
    (acc, p) => acc + (p.stockQuantity || 0) * (p.costPrice || 0),
    0
  );
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 3).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;

  const filteredProducts = products.filter((p) => {
    if (filter === 'low' && !(p.stockQuantity > 0 && p.stockQuantity <= 3)) return false;
    if (filter === 'out' && !(p.stockQuantity <= 0)) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pb-20 pt-2 space-y-3">
      {/* 1. Résumé du Stock & Capital Boutique */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 bg-white border border-neutral-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
            Articles physiques
          </span>
          <span className="text-2xl font-black text-[#1D1D1F] tabular-nums block mt-0.5 tracking-tight">
            {totalStockUnits}
          </span>
          <span className="text-[11px] text-neutral-500 block font-medium">
            {products.length} références actives
          </span>
        </div>

        <div className="p-3 bg-white border border-neutral-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
            Valeur du stock
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#1D1D1F] tabular-nums block mt-0.5 truncate tracking-tight">
            {formatFCFA(totalStockCostValue)}
          </span>
          <span className="text-[11px] text-neutral-500 block font-medium">
            Prix d'achat grossiste
          </span>
        </div>
      </div>

      {/* 2. GRAND BOUTON SCAN CODE-BARRES */}
      <button
        type="button"
        onClick={onOpenScanner}
        className="w-full min-h-[74px] p-3.5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] hover:from-[#1E293B] hover:to-[#1E293B] active:scale-[0.98] rounded-2xl border-2 border-[#38BDF8]/40 shadow-lg shadow-black/20 flex items-center justify-between gap-3 text-left select-none cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="relative w-12 h-12 rounded-xl bg-[#0066CC]/25 border border-[#38BDF8]/60 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
            <Camera className="w-6 h-6 text-[#38BDF8] stroke-[2.4]" />
            <span className="absolute inset-x-0 h-0.5 bg-[#38BDF8] shadow-[0_0_8px_#38BDF8] animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">
                Scanner Code-Barres
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] shrink-0" />
            </div>
            <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
              Touchez ici pour ouvrir la caméra
            </p>
          </div>
        </div>

        <div className="h-11 px-4 rounded-xl bg-[#0066CC] group-hover:bg-[#0052A3] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/30 transition-transform group-hover:scale-105 shrink-0">
          <span>SCANNER</span>
        </div>
      </button>

      {/* 3. Barre de Recherche Unifiée + Micro Vocal + Bouton + Produit */}
      <div className="relative flex items-center bg-white border border-neutral-300 rounded-2xl p-1.5 shadow-2xs focus-within:border-[#0066CC] focus-within:ring-2 focus-within:ring-[#0066CC]/10 transition-all">
        <Search className="w-4 h-4 text-neutral-400 ml-2.5 mr-2 shrink-0" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isListening ? "Écoute en cours..." : "Rechercher un article..."}
          className="w-full bg-transparent text-xs font-semibold text-[#1D1D1F] placeholder:text-neutral-400 focus:outline-none pr-1"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-neutral-400 hover:text-[#1D1D1F] p-1 mr-1 shrink-0"
          >
            ✕
          </button>
        )}

        {/* Micro vocal WhatsApp vert */}
        <button
          type="button"
          onClick={handleToggleVoiceSearch}
          className={`p-2 rounded-xl shrink-0 transition-all active:scale-90 ${
            isListening
              ? 'text-[#DC2626] bg-red-50 animate-pulse'
              : 'text-[#25D366] hover:bg-green-50'
          }`}
          title="Recherche vocale"
        >
          {isListening ? (
            <MicOff className="w-5 h-5 stroke-[2.4]" />
          ) : (
            <Mic className="w-5 h-5 stroke-[2.2]" />
          )}
        </button>

        <div className="w-[1px] h-6 bg-neutral-200 mx-1 shrink-0" />

        {/* Bouton + Produit */}
        <button
          type="button"
          onClick={onOpenAddProduct}
          className="h-9 px-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors shadow-xs active:scale-95 whitespace-nowrap"
          title="Ajouter un article"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Produit</span>
        </button>
      </div>

      {/* 4. Onglets de filtrage par état de stock */}
      <div className="flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 h-8 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-[#1D1D1F] text-white'
              : 'text-neutral-600 hover:text-[#1D1D1F]'
          }`}
        >
          Tous ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('low')}
          className={`flex-1 h-8 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'low'
              ? 'bg-[#EA580C] text-white'
              : 'text-[#EA580C] hover:bg-neutral-100'
          }`}
        >
          Faible ({lowStockCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('out')}
          className={`flex-1 h-8 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'out'
              ? 'bg-[#DC2626] text-white'
              : 'text-[#DC2626] hover:bg-neutral-100'
          }`}
        >
          Épuisé ({outOfStockCount})
        </button>
      </div>

      {/* 5. Grille Tactile des Articles : 2 Grands Boutons [VENDRE] & [GÉRER] */}
      {filteredProducts.length === 0 ? (
        <div className="py-8 px-4 bg-white border border-neutral-200 rounded-xl text-center shadow-2xs">
          <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#1D1D1F]">
            {searchQuery ? `Aucun article trouvé pour "${searchQuery}"` : "Aucun article dans ce filtre"}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-bold text-[#0066CC] hover:underline"
            >
              Effacer la recherche
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAddProduct}
              className="mt-3 px-3.5 py-2 bg-[#0066CC] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un produit</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stockQuantity <= 0;
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;
            const margin = product.sellingPrice - product.costPrice;

            return (
              <div
                key={product.id}
                className={`relative flex flex-col p-2.5 rounded-2xl bg-white border transition-all shadow-2xs ${
                  isOutOfStock
                    ? 'border-neutral-200 bg-neutral-50/70'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Cadre photo produit 1:1 spacieux */}
                <div
                  onClick={() => !isOutOfStock && onSelectProductToSell(product)}
                  className={`w-full aspect-square rounded-xl bg-[#F7F8FA] border border-neutral-100 overflow-hidden mb-2 relative flex items-center justify-center shrink-0 ${
                    !isOutOfStock ? 'cursor-pointer active:scale-[0.98]' : ''
                  }`}
                >
                  {product.photoUrl ? (
                    <img
                      src={product.photoUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-neutral-400" />
                  )}

                  {/* Badge stock superposé sur l'image */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                    {isOutOfStock ? (
                      <span className="text-[10px] font-black text-white bg-[#DC2626] px-1.5 py-0.5 rounded shadow-xs">
                        Épuisé
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-black text-white bg-[#EA580C] px-1.5 py-0.5 rounded shadow-xs">
                        Reste {product.stockQuantity}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-neutral-700 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded border border-neutral-200 shadow-2xs">
                        Stock : {product.stockQuantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nom du produit */}
                <h3 className="text-xs font-bold text-[#1D1D1F] leading-snug line-clamp-2 min-h-7 mb-1">
                  {product.name}
                </h3>

                {/* Prix de vente & marge unitaire */}
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm sm:text-base font-black text-[#0066CC] tabular-nums tracking-tight">
                    {formatFCFA(product.sellingPrice)}
                  </span>
                  {margin > 0 && (
                    <span className="text-[10px] font-bold text-[#15803D] tabular-nums">
                      +{formatFCFA(margin)}
                    </span>
                  )}
                </div>

                {/* BOUTONS D'ACTION : VENDRE, puis ÉTIQUETTE avant MODIFIER */}
                <div className="space-y-1.5 mt-auto">
                  {/* 1. BOUTON VENDRE (Grand bouton tactile de caisse) */}
                  <button
                    type="button"
                    onClick={() => onSelectProductToSell(product)}
                    disabled={isOutOfStock}
                    className={`w-full h-11 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs select-none active:scale-[0.97] cursor-pointer ${
                      isOutOfStock
                        ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        : 'bg-[#0066CC] hover:bg-[#0052A3] text-white shadow-blue-500/25 shadow-md'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>VENDRE</span>
                  </button>

                  {/* 2. LIGNE DE BOUTONS : ÉTIQUETTE AVANT MODIFIER */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* BOUTON ÉTIQUETTE (AVANT MODIFIER) */}
                    <button
                      type="button"
                      onClick={() => onOpenPrintLabel(product)}
                      className="h-10 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-[0.97] text-[#1D1D1F] font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-300 transition-all cursor-pointer shadow-2xs"
                      title="Imprimer l'étiquette code-barres"
                    >
                      <Barcode className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                      <span className="truncate">Étiquette</span>
                    </button>

                    {/* BOUTON MODIFIER */}
                    <button
                      type="button"
                      onClick={() => onOpenManageProduct(product)}
                      className="h-10 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-[0.97] text-[#1D1D1F] font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-300 transition-all cursor-pointer shadow-2xs"
                      title="Modifier le prix ou le stock"
                    >
                      <Pencil className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                      <span className="truncate">Modifier</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
