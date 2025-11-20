import { PRIORITY_STYLES, PRIORITY_MAP } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_STYLES[priority]}`}>
      {PRIORITY_MAP[priority]}
    </span>
  );
}