import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer, Download, X, Check, Copy } from 'lucide-react';
import { Product } from '../types';
import { formatFCFA } from '../utils/formatters';

interface PrintLabelModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({
  product,
  isOpen,
  onClose,
  shopName,
}) => {
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!product || !isOpen || !svgRef.current) return;

    try {
      JsBarcode(svgRef.current, product.barcode, {
        format: 'CODE128',
        width: 1.8,
        height: 60,
        displayValue: true,
        font: 'monospace',
        fontSize: 12,
        textMargin: 3,
        lineColor: '#000000',
        background: '#ffffff',
        margin: 4,
      });
    } catch (err) {
      console.warn('Barcode rendering error:', err);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-barres-${product.barcode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(product.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl flex flex-col border border-neutral-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div>
            <h2 className="text-xs font-black text-[#1D1D1F] uppercase tracking-wide">
              Étiquette Code-Barres
            </h2>
            <p className="text-[11px] text-neutral-500">Format imprimante thermique 58mm</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-[#1D1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Thermal Label Preview (1D Barcode with vertical stripes) */}
        <div className="my-4 flex flex-col items-center">
          <div
            id="printable-thermal-label"
            className="w-[240px] bg-white border border-neutral-400 rounded-lg p-3.5 shadow-2xs text-center flex flex-col items-center"
          >
            {/* Store title */}
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1D1D1F]">
              {shopName || 'BOUTIQUE'}
            </span>
            <div className="w-full h-px bg-neutral-200 my-1.5" />

            {/* Product Name */}
            <p className="text-xs font-bold text-[#1D1D1F] leading-snug line-clamp-2 max-h-8 mb-2">
              {product.name}
            </p>

            {/* 1D Linear Barcode Rendering (Vertical Bars) */}
            <div className="w-full bg-white flex items-center justify-center my-1 overflow-hidden">
              <svg ref={svgRef} className="max-w-full" />
            </div>

            {/* Price in big bold */}
            <div className="w-full h-px bg-neutral-200 my-1.5" />
            <div className="text-base font-black text-[#1D1D1F] tabular-nums tracking-tight">
              {formatFCFA(product.sellingPrice)}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 text-center mb-3">
          Collez ce code-barres sur l'emballage pour le scanner à la caisse.
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full h-11 px-4 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] active:translate-y-px text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Imprimer étiquette code-barres (58mm)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="h-9 px-3 rounded-lg bg-[#F7F8FA] hover:bg-neutral-200 text-[#1D1D1F] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-200"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Télécharger</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="h-9 px-3 rounded-lg bg-[#F7F8FA] hover:bg-neutral-200 text-[#1D1D1F] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#15803D]" />
                  <span className="text-[#15803D] font-bold">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copier code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
