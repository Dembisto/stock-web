import React, { useState } from 'react';
import { RotateCcw, History, Package } from 'lucide-react';
import { Sale } from '../types';
import { formatFCFA, formatTimeAgo } from '../utils/formatters';

interface HistoryViewProps {
  sales: Sale[];
  onCancelSale: (saleId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sales,
  onCancelSale,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all');

  const filteredSales = sales.filter((s) => {
    if (filter === 'active') return !s.cancelled;
    if (filter === 'cancelled') return s.cancelled;
    return true;
  });

  return (
    <div className="pb-20 pt-2">
      {/* Top Filter Buttons: Clean Rectangular Segments */}
      <div className="flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-xl mb-3">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 h-9 text-xs font-bold rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-[#1D1D1F] text-white'
              : 'text-neutral-600 hover:text-[#1D1D1F]'
          }`}
        >
          Toutes ({sales.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 h-9 text-xs font-bold rounded-lg transition-colors ${
            filter === 'active'
              ? 'bg-[#1D1D1F] text-white'
              : 'text-neutral-600 hover:text-[#1D1D1F]'
          }`}
        >
          Valides
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`flex-1 h-9 text-xs font-bold rounded-lg transition-colors ${
            filter === 'cancelled'
              ? 'bg-[#1D1D1F] text-white'
              : 'text-neutral-600 hover:text-[#1D1D1F]'
          }`}
        >
          Annulées
        </button>
      </div>

      {filteredSales.length === 0 ? (
        <div className="p-8 bg-white border border-neutral-200 rounded-xl text-center shadow-2xs">
          <History className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#1D1D1F]">Aucune vente dans l'historique</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              className={`p-3 rounded-xl border transition-all ${
                sale.cancelled
                  ? 'bg-neutral-50 border-neutral-200 opacity-60'
                  : 'bg-white border-neutral-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-[#F7F8FA] border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {sale.productPhotoUrl ? (
                    <img
                      src={sale.productPhotoUrl}
                      alt={sale.productName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-neutral-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-xs font-bold text-[#1D1D1F] truncate">
                        {sale.productName}
                      </h3>
                    </div>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                      {formatTimeAgo(sale.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-xs text-neutral-500 font-medium">
                      {sale.quantity} × {formatFCFA(sale.sellingPrice)}
                    </span>
                    <span
                      className={`text-sm font-black tabular-nums tracking-tight ${
                        sale.cancelled ? 'text-neutral-400 line-through' : 'text-[#1D1D1F]'
                      }`}
                    >
                      {formatFCFA(sale.totalAmount)}
                    </span>
                  </div>

                  {/* Actions & Margin */}
                  <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                    {sale.cancelled ? (
                      <span className="text-[11px] text-[#DC2626] font-bold">
                        Vente annulée (stock restitué)
                      </span>
                    ) : (
                      <>
                        <span className="text-[11px] text-[#15803D] font-bold">
                          Gain : +{formatFCFA(sale.margin)}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Annuler cette vente de "${sale.quantity}x ${sale.productName}" ?`
                              )
                            ) {
                              onCancelSale(sale.id);
                            }
                          }}
                          className="h-7 px-2.5 rounded-lg bg-neutral-100 hover:bg-red-50 hover:text-[#DC2626] text-neutral-600 text-[11px] font-semibold border border-neutral-200 flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Annuler</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
