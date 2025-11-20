import Card from '@/components/ui/Card';
import type { LucideIcon } from 'lucide-react';
import { Calendar, CalendarCheck, Clock, TriangleAlert } from 'lucide-react';

interface StatsCardsProps {
  totalOrders: number;
  openOrders: number;
  closedOrders: number;
  overdue: number;
}

export default function StatsCards({ totalOrders, openOrders, closedOrders, overdue }: StatsCardsProps) {
  const stats: Array<{
    name: string;
    value: number;
    icon: LucideIcon;
    color: string;
  }> = [
    {
      name: 'Total de Ordens',
      value: totalOrders,
      icon: Calendar,
      color: 'bg-slate-500',
    },
    {
      name: 'Ordens Abertas',
      value: openOrders,
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      name: 'Ordens Concluídas',
      value: closedOrders,
      icon: CalendarCheck,
      color: 'bg-green-500',
    },
    {
      name: 'Ordens em Atraso',
      value: overdue,
      icon: TriangleAlert,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={stat.name} 
          padding="md"
          className="animate-fade-up"
          style={{ animationDelay: `${index * 200}ms` }}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
              <stat.icon className={`h-6 w-6 text-white ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">{stat.name}</p>
              <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}