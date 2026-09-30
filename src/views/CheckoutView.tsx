import React, { useState, useRef, useEffect } from 'react';
import { Barcode, Search, ShoppingBag, Plus, Package, Camera, Mic, MicOff } from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../utils/formatters';
import { soundEffects } from '../utils/audioGuide';

interface CheckoutViewProps {
  products: Product[];
  onSelectProductToSell: (product: Product) => void;
  onOpenScanner: () => void;
  onOpenAddProduct: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  products,
  onSelectProductToSell,
  onOpenScanner,
  onOpenAddProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: any;
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

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3 pb-6">
      {/* 
        OPTION 3 : VISEUR ÉPURÉ & NÉON (Style Ultra Moderne)
        Fidèle à 100% à la maquette sélectionnée par l'utilisateur
      */}
      <button
        type="button"
        onClick={onOpenScanner}
        className="group w-full min-h-[76px] p-3 sm:p-3.5 bg-[#0D131F] hover:bg-[#080C14] active:scale-[0.98] rounded-2xl border border-slate-800 transition-all shadow-md shadow-black/25 flex items-center justify-between gap-3 text-left select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Viseur optique sombre avec 4 coins cyan et faisceau laser néon */}
          <div className="relative w-13 h-13 rounded-xl bg-[#141C2B] border border-[#1E293B] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
            <svg
              className="w-7 h-7 text-[#38BDF8]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* 4 coins du viseur optique */}
              <path d="M4 8V6a2 2 0 0 1 2-2h2" />
              <path d="M16 4h2a2 2 0 0 1 2 2v2" />
              <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
              <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
              {/* Faisceau laser cyan néon */}
              <line
                x1="3"
                y1="12"
                x2="21"
                y2="12"
                className="stroke-[#38BDF8] stroke-[2.2] animate-pulse drop-shadow-[0_0_6px_#38BDF8]"
              />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                Scan instantané
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] shrink-0" />
            </div>
          </div>
        </div>

        {/* Bouton Ouvrir */}
        <div className="shrink-0 flex items-center gap-1.5 bg-[#2B7FFF] group-hover:bg-[#1D6AE5] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-[#2B7FFF]/25 transition-colors">
          <Camera className="w-4 h-4 text-white" />
          <span>Ouvrir</span>
        </div>
      </button>

      {/* 
        Barre de Recherche Unifiée en Gélule (Style Image Maquette)
        [ 🔍 Rechercher un article...   🎙️  |  + Produit ]
      */}
      <div className="relative flex items-center bg-white border border-neutral-300 rounded-2xl p-1.5 shadow-2xs focus-within:border-[#0066CC] focus-within:ring-2 focus-within:ring-[#0066CC]/10 transition-all">
        {/* Loupe de recherche */}
        <Search className="w-4 h-4 text-neutral-400 ml-2.5 mr-2 shrink-0" />

        {/* Champ de saisie */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isListening ? "Écoute en cours..." : "Rechercher un article..."}
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

        {/* Bouton Micro Style WhatsApp vert dans la barre */}
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

        {/* Bouton + Produit bleu (Garde seulement le mot produit) */}
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

      {/* Sous-titre du Catalogue */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium px-0.5">
        <span>Ou touchez un article :</span>
        <span className="tabular-nums font-bold text-neutral-600">{filteredProducts.length} articles</span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="my-6 p-6 bg-white border border-neutral-200 rounded-xl text-center shadow-2xs">
          <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#1D1D1F]">Aucun article trouvé</p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {searchQuery
              ? `Aucun code-barres ou nom correspondant à "${searchQuery}"`
              : "Le catalogue est vide pour le moment."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs font-bold text-[#0066CC] hover:underline"
            >
              Effacer la recherche
            </button>
          )}
          <div className="mt-3">
            <button
              onClick={onOpenAddProduct}
              className="px-3.5 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un nouvel article</span>
            </button>
          </div>
        </div>
      ) : (
        /* Grille tactile mobile à 2 colonnes */
        <div className="grid grid-cols-2 gap-2.5">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stockQuantity <= 0;
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelectProductToSell(product)}
                disabled={isOutOfStock}
                className={`relative flex flex-col p-2.5 rounded-xl bg-white border text-left transition-all active:scale-[0.98] select-none ${
                  isOutOfStock
                    ? 'opacity-40 border-neutral-200 cursor-not-allowed bg-neutral-50'
                    : 'border-neutral-200 hover:border-[#0066CC] active:border-[#0066CC] active:bg-[#F7F8FA] shadow-2xs'
                }`}
              >
                {/* Cadre photo produit 1:1 */}
                <div className="w-full aspect-square rounded-lg bg-[#F7F8FA] border border-neutral-100 overflow-hidden mb-2 relative flex items-center justify-center shrink-0">
                  {product.photoUrl ? (
                    <img
                      src={product.photoUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-7 h-7 text-neutral-400" />
                  )}
                </div>

                {/* Nom */}
                <h3 className="text-xs font-bold text-[#1D1D1F] leading-snug line-clamp-2 min-h-7 mb-1">
                  {product.name}
                </h3>

                {/* État du stock */}
                <div className="text-[10px] mb-2 leading-none flex items-center gap-1 font-semibold">
                  {isOutOfStock ? (
                    <span className="text-[#DC2626]">● Épuisé</span>
                  ) : isLowStock ? (
                    <span className="text-[#EA580C]">● Reste {product.stockQuantity}</span>
                  ) : (
                    <span className="text-neutral-500 font-medium">Stock : {product.stockQuantity}</span>
                  )}
                </div>

                {/* Prix & Vendre */}
                <div className="mt-auto pt-1.5 border-t border-neutral-100 flex items-baseline justify-between">
                  <span className="text-xs sm:text-sm font-black text-[#1D1D1F] tabular-nums tracking-tight truncate">
                    {formatFCFA(product.sellingPrice)}
                  </span>
                  <span className="text-[10px] font-bold text-[#0066CC] shrink-0 ml-1">
                    Vendre
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
