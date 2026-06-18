'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface StatusData {
  name: string;
  value: number;
}

interface PatientStatusChartProps {
  data: StatusData[];
  title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  'Active': '#10b981',
  'Inactive': '#6b7280',
  'Pending': '#f59e0b',
  'Cancelled': '#ef4444',
};

export function PatientStatusChart({
  data,
  title = 'Patient Status',
}: PatientStatusChartProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            formatter={(value) => `${value} patients`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
