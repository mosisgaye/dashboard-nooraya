export function formatDate(date: string | Date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatCurrency(amount: number, compact = false) {
  if (typeof compact === 'string') {
    // Si compact est une devise, utiliser l'ancienne logique
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: compact,
    }).format(amount);
  }
  
  // Si compact est un boolean
  if (compact && amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M XOF`;
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat('fr-FR').format(number);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}