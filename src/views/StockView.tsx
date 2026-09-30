import React, { useState, useRef, useEffect } from 'react';
import { Package, Plus, PackagePlus, Barcode, Trash2, Search, Mic, MicOff } from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../utils/formatters';
import { soundEffects } from '../utils/audioGuide';

interface StockViewProps {
  products: Product[];
  onOpenAddProduct: () => void;
  onOpenArrivage: (product: Product) => void;
  onOpenPrintLabel: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const StockView: React.FC<StockViewProps> = ({
  products,
  onOpenAddProduct,
  onOpenArrivage,
  onOpenPrintLabel,
  onDeleteProduct,
}) => {
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');
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
    // Filtrage statut stock
    if (filter === 'low' && !(p.stockQuantity > 0 && p.stockQuantity <= 3)) return false;
    if (filter === 'out' && !(p.stockQuantity <= 0)) return false;

    // Filtrage par texte de recherche
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pb-20 pt-2 space-y-3">
      {/* Tableaux de bord synthétiques du stock */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 bg-white border border-neutral-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
            Articles physiques
          </span>
          <span className="text-2xl font-black text-[#1D1D1F] tabular-nums block mt-1 tracking-tight">
            {totalStockUnits}
          </span>
          <span className="text-[11px] text-neutral-500 block mt-0.5 font-medium">
            {products.length} références actives
          </span>
        </div>

        <div className="p-3.5 bg-white border border-neutral-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
            Capital en stock
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#1D1D1F] tabular-nums block mt-1 truncate tracking-tight">
            {formatFCFA(totalStockCostValue)}
          </span>
          <span className="text-[11px] text-neutral-500 block mt-0.5 font-medium">
            Prix d'achat grossiste
          </span>
        </div>
      </div>

      {/* 
        Barre de Recherche Unifiée en Gélule (Identique à la Caisse)
        [ 🔍 Rechercher un article...   🎙️  |  + Produit ]
      */}
      <div className="relative flex items-center bg-white border border-neutral-300 rounded-2xl p-1.5 shadow-2xs focus-within:border-[#0066CC] focus-within:ring-2 focus-within:ring-[#0066CC]/10 transition-all">
        {/* Loupe */}
        <Search className="w-4 h-4 text-neutral-400 ml-2.5 mr-2 shrink-0" />

        {/* Champ de saisie */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isListening ? "Écoute en cours..." : "Rechercher dans le stock..."}
          className="w-full bg-transparent text-xs font-semibold text-[#1D1D1F] placeholder:text-neutral-400 focus:outline-none pr-1"
        />

        {/* Bouton Effacer si texte présent */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-neutral-400 hover:text-[#1D1D1F] p-1 mr-1 shrink-0"
          >
            ✕
          </button>
        )}

        {/* Bouton Vocal Style WhatsApp vert */}
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

        {/* Séparateur vertical fin */}
        <div className="w-[1px] h-6 bg-neutral-200 mx-1 shrink-0" />

        {/* Bouton + Produit bleu */}
        <button
          type="button"
          onClick={onOpenAddProduct}
          className="h-9 px-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-1 shrink-0 transition-colors shadow-xs active:scale-95 whitespace-nowrap"
          title="Ajouter un article au catalogue"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Produit</span>
        </button>
      </div>

      {/* Onglets de filtrage par niveau de stock */}
      <div className="flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 h-9 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
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
          className={`flex-1 h-9 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
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
          className={`flex-1 h-9 px-3 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filter === 'out'
              ? 'bg-[#DC2626] text-white'
              : 'text-[#DC2626] hover:bg-neutral-100'
          }`}
        >
          Épuisé ({outOfStockCount})
        </button>
      </div>

      {/* Liste des articles en stock */}
      <div className="space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="p-8 bg-white border border-neutral-200 rounded-xl text-center shadow-2xs">
            <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#1D1D1F]">
              {searchQuery ? `Aucun article trouvé pour "${searchQuery}"` : "Aucun article dans ce filtre"}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-[#0066CC] hover:underline"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isOutOfStock = product.stockQuantity <= 0;
            const isLow = product.stockQuantity > 0 && product.stockQuantity <= 3;
            const margin = product.sellingPrice - product.costPrice;

            return (
              <div
                key={product.id}
                className="p-3 bg-white border border-neutral-200 rounded-xl shadow-2xs flex flex-col gap-2.5"
              >
                {/* Ligne produit */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-[#F7F8FA] border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
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
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-xs font-bold text-[#1D1D1F] truncate">
                        {product.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Supprimer définitivement "${product.name}" ?`
                            )
                          ) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="text-neutral-400 hover:text-[#DC2626] p-1"
                        title="Supprimer le produit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Vente vs Achat & Bénéfice */}
                    <div className="mt-1 flex items-baseline gap-2.5 text-xs flex-wrap font-medium">
                      <div>
                        <span className="text-neutral-500">Vente : </span>
                        <span className="font-bold text-[#1D1D1F]">{formatFCFA(product.sellingPrice)}</span>
                      </div>
                      <span className="text-neutral-300">·</span>
                      <div>
                        <span className="text-neutral-500">Achat : </span>
                        <span className="text-neutral-700">{formatFCFA(product.costPrice)}</span>
                      </div>
                      {margin > 0 && (
                        <>
                          <span className="text-neutral-300">·</span>
                          <span className="text-[#15803D] font-bold">+{formatFCFA(margin)} gain</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Niveau de stock & Actions rapides */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                  {/* État du stock */}
                  <div className="flex items-center gap-1.5">
                    {isOutOfStock ? (
                      <span className="font-bold text-[#DC2626]">● 0 en stock (Épuisé)</span>
                    ) : isLow ? (
                      <span className="font-bold text-[#EA580C]">● {product.stockQuantity} restants (Faible)</span>
                    ) : (
                      <span className="font-bold text-[#1D1D1F]">● {product.stockQuantity} en stock</span>
                    )}
                  </div>

                  {/* Actions: Code-barres & Arrivage */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenPrintLabel(product)}
                      className="h-8 px-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] font-bold text-[11px] flex items-center gap-1.5 transition-colors border border-neutral-200"
                    >
                      <Barcode className="w-4 h-4 text-neutral-700" />
                      <span>Code-barres</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenArrivage(product)}
                      className="h-8 px-3 rounded-lg bg-[#1D1D1F] hover:bg-black active:translate-y-px text-white font-bold text-[11px] flex items-center gap-1 transition-all"
                    >
                      <PackagePlus className="w-3.5 h-3.5 text-white" />
                      <span>+ Arrivage</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
