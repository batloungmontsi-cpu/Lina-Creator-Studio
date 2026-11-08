export function formatNumber(number) {
  return new Intl.NumberFormat('en', {
    notation: number > 999 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(number);
}
