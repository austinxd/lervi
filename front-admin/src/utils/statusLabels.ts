type ChipInfo = { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' };

export const OPERATIONAL_STATUS: Record<string, ChipInfo> = {
  incomplete: { label: 'Incompleta', color: 'default' },
  pending: { label: 'Pendiente', color: 'warning' },
  confirmed: { label: 'Confirmada', color: 'info' },
  check_in: { label: 'Check-in', color: 'success' },
  check_out: { label: 'Check-out', color: 'default' },
  cancelled: { label: 'Cancelada', color: 'error' },
  no_show: { label: 'No-show', color: 'error' },
};

export const FINANCIAL_STATUS: Record<string, ChipInfo> = {
  pending_payment: { label: 'Pend. pago', color: 'warning' },
  partial: { label: 'Parcial', color: 'info' },
  paid: { label: 'Pagada', color: 'success' },
  partial_refund: { label: 'Reemb. parcial', color: 'secondary' },
  refunded: { label: 'Reembolsada', color: 'error' },
};

export const ROOM_STATUS: Record<string, ChipInfo> = {
  available: { label: 'Disponible', color: 'success' },
  occupied: { label: 'Ocupada', color: 'primary' },
  dirty: { label: 'Sucia', color: 'warning' },
  cleaning: { label: 'Limpieza', color: 'info' },
  inspection: { label: 'Inspección', color: 'secondary' },
  blocked: { label: 'Bloqueada', color: 'error' },
  maintenance: { label: 'Mantenimiento', color: 'default' },
};

export const TASK_STATUS: Record<string, ChipInfo> = {
  pending: { label: 'Pendiente', color: 'warning' },
  in_progress: { label: 'En progreso', color: 'info' },
  completed: { label: 'Completada', color: 'success' },
};

export const TASK_PRIORITY: Record<string, ChipInfo> = {
  normal: { label: 'Normal', color: 'default' },
  high: { label: 'Alta', color: 'warning' },
  urgent: { label: 'Urgente', color: 'error' },
};

export const TASK_TYPE_LABELS: Record<string, string> = {
  cleaning: 'Limpieza',
  inspection: 'Inspección',
  maintenance: 'Mantenimiento',
  bed_prep: 'Prep. camas',
  other: 'Otro',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  online: 'Online',
};

export const ORIGIN_TYPE_LABELS: Record<string, string> = {
  website: 'Website',
  walk_in: 'Walk-in',
  phone: 'Teléfono',
  ota: 'OTA',
  other: 'Otro',
};

export const ROOM_STATUS_TRANSITIONS: Record<string, string[]> = {
  available: ['occupied', 'blocked', 'maintenance'],
  occupied: ['dirty'],
  dirty: ['cleaning'],
  cleaning: ['inspection'],
  inspection: ['available', 'dirty'],
  blocked: ['available'],
  maintenance: ['available'],
};
