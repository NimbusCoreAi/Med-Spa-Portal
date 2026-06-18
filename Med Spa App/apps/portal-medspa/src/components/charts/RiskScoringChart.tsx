'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface RiskData {
  name: string;
  value: number;
}

interface RiskScoringChartProps {
  data: RiskData[];
  title?: string;
}

const RISK_COLORS: Record<string, string> = {
  'High Risk': '#ef4444',
  'Medium Risk': '#f59e0b',
  'Low Risk': '#3b82f6',
};

export function RiskScoringChart({
  data,
  title = 'Risk Distribution',
}: RiskScoringChartProps) {
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
              <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#94a3b8'} />
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
