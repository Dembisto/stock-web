import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, AlertCircle, Barcode } from 'lucide-react';
import { Product } from '../types';
import { soundEffects } from '../utils/audioGuide';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductFound: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductFound,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = 'jaay-barcode-reader-view';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        await new Promise((resolve) => setTimeout(resolve, 250));
        if (!isMounted) return;

        // Configured strictly for 1D retail linear barcodes (EAN-13, Code 128, UPC, etc.)
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ];

        const html5QrCode = new Html5Qrcode(elementId, {
          formatsToSupport,
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        // Wide horizontal viewfinder specifically optimized for 1D barcodes
        const config = {
          fps: 15,
          qrbox: { width: 280, height: 120 },
          aspectRatio: 1.333,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleCodeScanned(decodedText);
          },
          () => {}
        );
      } catch (err: unknown) {
        console.warn('Camera barcode scanner error:', err);
        setCameraError(
          "Caméra indisponible ou autorisation non accordée. Vous pouvez tester directement en cliquant sur un code-barres ci-dessous."
        );
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
  };

  const handleCodeScanned = (code: string) => {
    soundEffects.playScanBeep();
    stopScanner();

    const cleanCode = code.trim().toLowerCase();
    const matchedProduct = products.find(
      (p) =>
        p.barcode.toLowerCase() === cleanCode ||
        p.id.toLowerCase() === cleanCode ||
        cleanCode.includes(p.barcode.toLowerCase()) ||
        cleanCode.includes(p.id.toLowerCase())
    );

    if (matchedProduct) {
      onProductFound(matchedProduct);
      onClose();
    } else {
      setCameraError(`Aucun produit trouvé pour le code-barres : "${code}".`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-neutral-300">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-[#F7F8FA]">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-[#0066CC]" />
            <h2 className="text-xs font-black text-[#1D1D1F] uppercase tracking-wide">
              Lecteur de Code-Barres
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#1D1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal 1D Viewfinder Area */}
        <div className="p-4 flex flex-col items-center">
          <div className="w-full relative rounded-xl overflow-hidden bg-black aspect-[4/3] max-w-[320px] flex items-center justify-center border border-neutral-800">
            <div id={elementId} className="w-full h-full object-cover" />

            {/* 1D Linear Barcode Reticle (Horizontal Rectangle) */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              <div className="w-68 h-26 border border-white/70 rounded-lg relative">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#0066CC]" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#0066CC]" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#0066CC]" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#0066CC]" />

                {/* Laser scan line across the barcode */}
                <div className="w-full h-0.5 bg-[#DC2626] shadow-sm shadow-[#DC2626] absolute top-1/2 -translate-y-1/2 animate-pulse" />
              </div>
            </div>

            <div className="absolute bottom-2 text-center">
              <span className="text-[10px] font-bold text-white bg-black/75 px-3 py-0.5 rounded tracking-wide">
                Cadrez les barres dans le rectangle
              </span>
            </div>
          </div>

          {cameraError && (
            <div className="mt-3 p-2.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs text-neutral-800 flex items-start gap-2 max-w-sm">
              <AlertCircle className="w-4 h-4 text-[#0066CC] shrink-0 mt-0.5" />
              <p className="leading-snug">{cameraError}</p>
            </div>
          )}

          {/* Quick simulation buttons (Click to simulate scanning an item) */}
          <div className="w-full mt-3 pt-3 border-t border-neutral-100">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
              Test immédiat (Cliquez sur un code-barres) :
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {products.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleCodeScanned(p.barcode)}
                  className="p-2 bg-[#F7F8FA] hover:bg-neutral-100 border border-neutral-200 rounded-lg flex items-center gap-2 text-left transition-all active:scale-[0.98]"
                >
                  <Barcode className="w-5 h-5 text-neutral-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-[#1D1D1F] truncate">{p.name}</p>
                    <p className="text-[10px] text-neutral-500 font-mono tracking-wider">{p.barcode}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
