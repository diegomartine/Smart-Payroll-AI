const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formatea un valor (string u number, tal como llega del backend en
 * campos Decimal) como pesos colombianos: $3.500.000
 */
export function formatCOP(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return cop.format(0);
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return cop.format(0);
  return cop.format(num);
}
