import { Chip } from '@mui/material';

interface Props {
  statusMap: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }>;
  value: string;
  size?: 'small' | 'medium';
}

export default function StatusChip({ statusMap, value, size = 'small' }: Props) {
  const info = statusMap[value] ?? { label: value, color: 'default' as const };
  return <Chip label={info.label} color={info.color} size={size} />;
}
