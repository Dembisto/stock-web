import React, { useEffect, useState } from 'react';
import { RotateCcw, CheckCircle2, X } from 'lucide-react';
import { Sale } from '../types';
import { formatFCFA } from '../utils/formatters';

interface UndoToastProps {
  sale: Sale | null;
  onUndo: (saleId: string) => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  sale,
  onUndo,
  onDismiss,
}) => {
  const [timeLeft, setTimeLeft] = useState(7);

  useEffect(() => {
    if (!sale) return;
    setTimeLeft(7);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sale, onDismiss]);

  if (!sale) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center animate-in slide-in-from-top-4 duration-200">
      <div className="pointer-events-auto w-full max-w-md bg-[#1D1D1F] text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 border border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Indicateur positif : Vert #15803D */}
          <div className="w-8 h-8 rounded-xl bg-[#15803D]/20 text-[#15803D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">
              Vente : {sale.quantity}x {sale.productName}
            </p>
            <p className="text-[11px] text-emerald-400 font-extrabold tabular-nums">
              +{formatFCFA(sale.totalAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onUndo(sale.id);
              onDismiss();
            }}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white text-[#1D1D1F] hover:bg-neutral-100 active:scale-95 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Annuler ({timeLeft}s)</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
