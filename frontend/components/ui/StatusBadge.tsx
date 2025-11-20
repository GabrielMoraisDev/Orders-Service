import { STATUS_STYLES, STATUS_MAP } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'open' | 'closed' | 'unresolved';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]}`}>
      {STATUS_MAP[status]}
    </span>
  );
}