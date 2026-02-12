import dayjs from 'dayjs';

export function formatCurrency(amount: string | number, currency = 'PEN'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(num);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return dayjs(date).format('DD/MM/YYYY');
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}
