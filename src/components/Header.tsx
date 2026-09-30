import React, { useState, useEffect } from 'react';
import { Store, RotateCcw, Smartphone, X, Download } from 'lucide-react';

interface HeaderProps {
  shopName: string;
  onEditShopName: (name: string) => void;
  onResetData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  shopName,
  onEditShopName,
  onResetData,
}) => {
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [tempShopName, setTempShopName] = useState(shopName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowAndroidGuide(true);
    }
  };

  return (
    <>
      <header className="shrink-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-lg mx-auto px-3.5 h-13 flex items-center justify-between">
          {/* Mobile App Brand Bar */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1D1D1F] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Store className="w-4 h-4 text-white" />
            </div>

            <div className="min-w-0">
              {isEditingShop ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (tempShopName.trim()) onEditShopName(tempShopName.trim());
                    setIsEditingShop(false);
                  }}
                  className="flex items-center"
                >
                  <input
                    type="text"
                    value={tempShopName}
                    onChange={(e) => setTempShopName(e.target.value)}
                    onBlur={() => {
                      if (tempShopName.trim()) onEditShopName(tempShopName.trim());
                      setIsEditingShop(false);
                    }}
                    autoFocus
                    className="px-2 py-0.5 text-xs font-bold border border-[#0066CC] rounded bg-white text-[#1D1D1F] focus:outline-none"
                  />
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingShop(true)}
                  className="group flex items-baseline gap-1 focus:outline-none text-left max-w-full"
                  title="Modifier le nom de la boutique"
                >
                  <span className="text-xs font-bold text-[#1D1D1F] truncate group-hover:text-[#0066CC] transition-colors">
                    {shopName}
                  </span>
                  <span className="text-[10px] text-neutral-400 group-hover:text-[#0066CC]">✎</span>
                </button>
              )}
              <div className="text-[10px] text-neutral-500 font-medium flex items-center gap-1.5 leading-none mt-0.5">
                <span>Sénégal</span>
                <span className="text-neutral-300">·</span>
                <span className="font-bold text-[#0066CC]">Caisse FCFA</span>
              </div>
            </div>
          </div>

          {/* Right actions: Install on Android + Reset */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="h-8 px-2.5 rounded-lg bg-[#0066CC]/10 hover:bg-[#0066CC]/15 text-[#0066CC] font-bold text-xs flex items-center gap-1.5 border border-[#0066CC]/25 transition-all active:scale-95"
              title="Installer sur Android"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Installer</span>
              <span className="sm:hidden">App</span>
            </button>

            {onResetData && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Réinitialiser les données d’exemple ?')) {
                    onResetData();
                  }
                }}
                className="w-8 h-8 rounded-lg border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0 transition-colors"
                title="Réinitialiser les données d’exemple"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Guide d'installation Android Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-neutral-300 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                  <Smartphone className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-black text-[#1D1D1F] uppercase tracking-wide">
                  Installer sur téléphone Android
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAndroidGuide(false)}
                className="w-8 h-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-neutral-700">
              <p className="font-semibold text-neutral-900">
                Vous pouvez installer cette application directement sur votre écran d'accueil sans passer par le Play Store :
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <p className="flex-1">
                    Ouvrez le lien de l'application sur votre téléphone Android dans <strong>Google Chrome</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p className="flex-1">
                    Appuyez sur les <strong>3 petits points verticaux (⋮)</strong> en haut à droite du navigateur Chrome.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="w-6 h-6 rounded-full bg-[#0066CC] text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <p className="flex-1">
                    Appuyez sur <strong>« Installer l'application »</strong> (ou <em>« Ajouter à l'écran d'accueil »</em>).
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 text-[11px] leading-relaxed">
                ✨ L'application s'installera avec son icône <strong>Jaay</strong>, s'ouvrira en plein écran sans barre d'adresse et fonctionnera même hors-connexion.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAndroidGuide(false)}
              className="w-full h-11 rounded-xl bg-[#0066CC] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>J'ai compris</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
