import React, { useState } from 'react';
import { Plus, Receipt, Zap, Home, Truck, ShoppingBag, Trash2, Flame, TrendingDown, Package, Award } from 'lucide-react';
import { Sale, Expense, Product } from '../types';
import { formatFCFA } from '../utils/formatters';

interface ProfitsViewProps {
  products?: Product[];
  sales: Sale[];
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ProfitsView: React.FC<ProfitsViewProps> = ({
  products = [],
  sales,
  expenses,
  onOpenAddExpense,
  onDeleteExpense,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'all'>('all');
  const [rankingTab, setRankingTab] = useState<'top' | 'least'>('top');

  const filterByPeriod = (isoDate: string) => {
    if (period === 'all') return true;
    const date = new Date(isoDate);
    const now = new Date();
    if (period === 'today') {
      return date.toDateString() === now.toDateString();
    }
    if (period === 'week') {
      const diffMs = now.getTime() - date.getTime();
      return diffMs <= 7 * 86400000;
    }
    return true;
  };

  const activeSales = sales.filter((s) => !s.cancelled && filterByPeriod(s.timestamp));
  const activeExpenses = expenses.filter((e) => filterByPeriod(e.date));

  const totalSalesRevenue = activeSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalGoodsCost = activeSales.reduce((acc, s) => acc + s.costPrice * s.quantity, 0);
  const grossProfit = totalSalesRevenue - totalGoodsCost;
  const totalExpensesAmount = activeExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalExpensesAmount;

  // Calcul des performances par article
  const productPerformance = products.map((product) => {
    const productSales = activeSales.filter((s) => s.productId === product.id);
    const unitsSold = productSales.reduce((acc, s) => acc + s.quantity, 0);
    const revenue = productSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const profit = productSales.reduce((acc, s) => acc + s.margin, 0);

    return {
      product,
      unitsSold,
      revenue,
      profit,
    };
  });

  // Articles les plus vendus (au moins 1 vente, triés par quantité vendue puis bénéfice)
  const topProducts = [...productPerformance]
    .filter((p) => p.unitsSold > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold || b.profit - a.profit);

  // Articles les moins vendus (inclut les 0 ventes pour alerter sur le stock dormant)
  const leastProducts = [...productPerformance]
    .sort((a, b) => a.unitsSold - b.unitsSold || b.product.stockQuantity - a.product.stockQuantity);

  const getCategoryIcon = (cat: Expense['category']) => {
    switch (cat) {
      case 'woyofal':
        return Zap;
      case 'loyer':
        return Home;
      case 'transport':
        return Truck;
      case 'emballage':
        return ShoppingBag;
      default:
        return Receipt;
    }
  };

  return (
    <div className="pb-20 pt-2 space-y-3">
      {/* Sélecteur de période */}
      <div className="flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-xl">
        <button
          type="button"
          onClick={() => setPeriod('today')}
          className={`flex-1 h-9 text-xs font-bold rounded-lg transition-colors ${
            period === 'today'
              ? 'bg-[#1D1D1F] text-white'
              : 'text-neutral-600 hover:text-[#1D1D1F]'
          }`}
        >
          Aujourd'hui
        </button>
        <button
          type="button"
          onClick={() => setPeriod('week')}
          className={`flex-1 h-9 text-xs font-bold rounded-lg transition-colors ${
            period === 'week'
              ? 'bg-[#1D1D1F] text-white'
              : 'text-neutral-600 hover:text-[#1D1D1F]'
          }`}
        >
          7 derniers jours
        </button>
        <button
          type="button"
          onClick={() => setPeriod('all')}
          className={`flex-1 h-9 text-xs font-bold rounded-lg transition-colors ${
            period === 'all'
              ? 'bg-[#1D1D1F] text-white'
              : 'text-neutral-600 hover:text-[#1D1D1F]'
          }`}
        >
          Historique complet
        </button>
      </div>

      {/* Carte Résumé Bénéfice Net Réel */}
      <div className="p-5 bg-white border border-neutral-300 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
            Bénéfice Net Réel
          </span>
          <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
            {activeSales.length} vente{activeSales.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="my-2">
          <span className={`text-4xl font-black tabular-nums tracking-tight block ${
            netProfit >= 0 ? 'text-[#15803D]' : 'text-[#DC2626]'
          }`}>
            {formatFCFA(netProfit)}
          </span>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Revenu disponible après déduction du coût des marchandises et charges boutique.
          </p>
        </div>
      </div>

      {/* Performance des Articles : Plus Vendus & Moins Vendus */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-neutral-100">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1D1D1F]">
              Rotation des articles
            </h3>
            <p className="text-[11px] text-neutral-500">
              Suivi des meilleures ventes et des stocks lents
            </p>
          </div>

          {/* Onglets de bascule Plus vendus / Moins vendus */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80 shrink-0">
            <button
              type="button"
              onClick={() => setRankingTab('top')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                rankingTab === 'top'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Plus vendus</span>
            </button>
            <button
              type="button"
              onClick={() => setRankingTab('least')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                rankingTab === 'least'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-neutral-500" />
              <span>Moins vendus</span>
            </button>
          </div>
        </div>

        {rankingTab === 'top' ? (
          /* Liste des articles les plus vendus */
          topProducts.length === 0 ? (
            <div className="py-6 px-4 bg-[#F7F8FA] rounded-xl text-center">
              <Award className="w-7 h-7 text-neutral-300 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-neutral-600">Aucune vente enregistrée sur cette période</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Les articles apparaîtront ici au fur et à mesure des encaissements.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {topProducts.slice(0, 5).map((item, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;

                return (
                  <div
                    key={item.product.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                      isFirst
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-[#F7F8FA] border-neutral-200/80'
                    }`}
                  >
                    {/* Rang & Photo */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-800'
                            : rank === 3
                            ? 'bg-amber-700/20 text-amber-900'
                            : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        {rank}
                      </div>

                      <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.product.photoUrl ? (
                          <img
                            src={item.product.photoUrl}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#1D1D1F] truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-neutral-500 font-medium">
                          <strong className="text-[#0066CC] font-black">{item.unitsSold} vendus</strong>
                          {' • '}
                          Stock restant : {item.product.stockQuantity}
                        </p>
                      </div>
                    </div>

                    {/* Bénéfice généré */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#15803D] tabular-nums block">
                        +{formatFCFA(item.profit)}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        de bénéfice
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Liste des articles les moins vendus */
          leastProducts.length === 0 ? (
            <div className="py-6 px-4 bg-[#F7F8FA] rounded-xl text-center">
              <Package className="w-7 h-7 text-neutral-300 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-neutral-600">Aucun produit dans le catalogue</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leastProducts.slice(0, 5).map((item) => {
                const hasZeroSales = item.unitsSold === 0;

                return (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl border border-neutral-200/80 bg-[#F7F8FA] flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.product.photoUrl ? (
                          <img
                            src={item.product.photoUrl}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#1D1D1F] truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {hasZeroSales ? (
                            <span className="text-[10px] font-bold text-[#DC2626] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              0 vente
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-neutral-600 bg-neutral-200/70 px-1.5 py-0.5 rounded">
                              {item.unitsSold} vente{item.unitsSold > 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-[11px] text-neutral-500">
                            En rayon : <strong>{item.product.stockQuantity}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#1D1D1F] tabular-nums block">
                        {formatFCFA(item.product.sellingPrice)}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        prix unitaire
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Détail financier */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-2xs text-xs">
        <div className="text-[11px] font-black uppercase tracking-wider text-neutral-500 mb-2.5 pb-1.5 border-b border-neutral-100">
          Détail des comptes
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Total ventes brutes (CA)</span>
            <span className="font-bold text-[#1D1D1F] tabular-nums">+{formatFCFA(totalSalesRevenue)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Coût d'achat marchandises (Grossistes)</span>
            <span className="font-semibold text-neutral-500 tabular-nums">-{formatFCFA(totalGoodsCost)}</span>
          </div>

          <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between font-bold">
            <span className="text-neutral-700">Marge brute commerciale</span>
            <span className="text-[#15803D] tabular-nums">+{formatFCFA(grossProfit)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Dépenses & charges d'exploitation</span>
            <span className="font-semibold text-[#DC2626] tabular-nums">-{formatFCFA(totalExpensesAmount)}</span>
          </div>
        </div>
      </div>

      {/* Charges & Dépenses de la boutique */}
      <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
          <div>
            <h3 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wide">
              Charges & Dépenses
            </h3>
            <p className="text-[11px] text-neutral-500">
              Woyofal, loyer, transport marchandise...
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="h-8 px-2.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 text-[#0066CC] font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dépense</span>
          </button>
        </div>

        {activeExpenses.length === 0 ? (
          <div className="p-4 bg-[#F7F8FA] rounded-lg text-center text-xs text-neutral-500">
            Aucune dépense enregistrée sur cette période.
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeExpenses.map((exp) => {
              const Icon = getCategoryIcon(exp.category);
              return (
                <div
                  key={exp.id}
                  className="p-2.5 bg-[#F7F8FA] border border-neutral-200/80 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1D1D1F] truncate">{exp.title}</p>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(exp.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-[#DC2626] tabular-nums">
                      -{formatFCFA(exp.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(exp.id)}
                      className="text-neutral-400 hover:text-[#DC2626] p-1"
                      title="Supprimer la dépense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
