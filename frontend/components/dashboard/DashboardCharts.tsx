'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { ServiceOrder } from '@/lib/types';

interface Props {
  orders: ServiceOrder[];
}

const STATUS_COLORS = {
  open: '#10B981',
  closed: '#3B82F6',
  unresolved: '#F59E0B',
};

const PRIORITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

const STATUS_LABELS = {
  open: 'Abertas',
  closed: 'Fechadas',
  unresolved: 'Não Resolvidas',
};

const PRIORITY_LABELS = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-2 border border-gray-200 rounded-lg">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <p key={index} className="text-sm text-gray-600">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardCharts: React.FC<Props> = ({ orders }) => {
  const statusData = useMemo(() => {
    const counts = { open: 0, closed: 0, unresolved: 0 } as Record<string, number>;
    const total = orders.length || 1;
    
    orders.forEach(o => { 
      counts[o.status] = (counts[o.status] || 0) + 1; 
    });
    
    return [
      { 
        name: STATUS_LABELS.open, 
        value: counts.open,
        percentage: ((counts.open / total) * 100).toFixed(1),
        color: STATUS_COLORS.open,
      },
      { 
        name: STATUS_LABELS.closed, 
        value: counts.closed,
        percentage: ((counts.closed / total) * 100).toFixed(1),
        color: STATUS_COLORS.closed,
      },
      { 
        name: STATUS_LABELS.unresolved, 
        value: counts.unresolved,
        percentage: ((counts.unresolved / total) * 100).toFixed(1),
        color: STATUS_COLORS.unresolved,
      },
    ].filter(item => item.value > 0);
  }, [orders]);

  const priorityData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 } as Record<string, number>;
    orders.forEach(o => { counts[o.priority] = (counts[o.priority] || 0) + 1; });
    return [
      { name: PRIORITY_LABELS.low, value: counts.low, fill: PRIORITY_COLORS.low },
      { name: PRIORITY_LABELS.medium, value: counts.medium, fill: PRIORITY_COLORS.medium },
      { name: PRIORITY_LABELS.high, value: counts.high, fill: PRIORITY_COLORS.high },
    ];
  }, [orders]);

  const trendData = useMemo(() => {
    const days = 30;
    const map = new Map<string, { created: number; closed: number }>();
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { created: 0, closed: 0 });
    }

    orders.forEach(o => {
      const createdKey = new Date(o.created_at).toISOString().slice(0, 10);
      if (map.has(createdKey)) {
        const data = map.get(createdKey)!;
        data.created++;
        map.set(createdKey, data);
      }
      
      if (o.updated_at && o.status === 'closed') {
        const closedKey = new Date(o.updated_at).toISOString().slice(0, 10);
        if (map.has(closedKey)) {
          const data = map.get(closedKey)!;
          data.closed++;
          map.set(closedKey, data);
        }
      }
    });

    return Array.from(map.entries()).map(([date, values]) => ({ 
      date, 
      criadas: values.created,
      fechadas: values.closed,
      dateFormatted: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }));
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Primeira linha - Status e Prioridade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status das Ordens - Pie Chart */}
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status das Ordens</h3>
            <p className="text-sm text-gray-500 mt-1">Distribuição por status atual</p>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <ReTooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span className="text-sm text-gray-700">
                      {value} ({(entry.payload as { value: number }).value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prioridade - Bar Chart */}
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Distribuição por Prioridade</h3>
            <p className="text-sm text-gray-500 mt-1">Quantidade de ordens por nível</p>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart 
                data={priorityData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIORITY_COLORS.low} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={PRIORITY_COLORS.low} stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIORITY_COLORS.medium} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={PRIORITY_COLORS.medium} stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIORITY_COLORS.high} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={PRIORITY_COLORS.high} stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <ReTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {priorityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#color${entry.name === 'Baixa' ? 'Low' : entry.name === 'Média' ? 'Medium' : 'High'})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segunda linha - Tendência (gráfico largo) */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tendência de Ordens</h3>
          <p className="text-sm text-gray-500 mt-1">Ordens criadas e fechadas nos últimos 30 dias</p>
        </div>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <AreaChart 
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="dateFormatted" 
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={{ stroke: '#E5E7EB' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <ReTooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-sm text-gray-700 capitalize">{value}</span>
                )}
              />
              <Area 
                type="monotone" 
                dataKey="criadas" 
                stroke="#10B981" 
                strokeWidth={2}
                fill="url(#colorCreated)"
                animationBegin={0}
                animationDuration={1000}
              />
              <Area 
                type="monotone" 
                dataKey="fechadas" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="url(#colorClosed)"
                animationBegin={0}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
