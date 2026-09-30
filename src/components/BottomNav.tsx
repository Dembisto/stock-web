import React from 'react';
import { Store, TrendingUp, History } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  lowStockCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  lowStockCount,
}) => {
  const tabs = [
    {
      id: 'boutique' as TabType,
      label: 'Boutique',
      badge: lowStockCount > 0 ? lowStockCount : null,
      icon: Store,
    },
    {
      id: 'benefices' as TabType,
      label: 'Bénéfices',
      icon: TrendingUp,
    },
    {
      id: 'historique' as TabType,
      label: 'Historique',
      icon: History,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200">
      <div className="max-w-2xl mx-auto grid grid-cols-3 h-15">
        {tabs.map((tab) => {
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'boutique' && (currentTab === 'caisse' || currentTab === 'stock'));
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 transition-colors select-none ${
                isActive
                  ? 'text-[#0066CC]'
                  : 'text-neutral-500 hover:text-[#1D1D1F]'
              }`}
            >
              {/* Crisp top hairline active indicator */}
              {isActive && (
                <span className="absolute top-0 left-4 right-4 h-0.5 bg-[#0066CC]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.4]' : 'stroke-[1.7]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-[#EA580C] text-white text-[9px] font-black px-1 rounded-sm min-w-3.5 text-center leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-semibold mt-1 tracking-tight ${
                  isActive ? 'text-[#0066CC] font-bold' : 'text-neutral-600'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
