/**
 * Format amounts into West African CFA Franc (FCFA)
 * Example: 17500 -> "17 500 FCFA"
 */
export function formatFCFA(amount: number): string {
  const rounded = Math.round(amount || 0);
  const formatted = new Intl.NumberFormat('fr-FR').format(rounded);
  return `${formatted} FCFA`;
}

/**
 * Format relative or short date in French
 */
export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMin / 60);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHours < 24 && date.toDateString() === now.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Generate a unique product barcode/QR string if none provided
 */
export function generateBarcode(prefix = 'SN'): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${rand}`;
}
