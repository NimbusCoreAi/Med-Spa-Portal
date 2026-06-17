'use client';

import { useState, useEffect } from 'react';

interface RiskFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  action: string;
}

interface RiskScore {
  overall_risk: 'low' | 'medium' | 'high';
  flags: RiskFlag[];
  recommendation: string;
  evaluated_at: string;
}

interface RiskPanelProps {
  patientId: string;
  clinicId: string;
}

const severityStyles: Record<string, string> = {
  high: 'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  low: 'bg-green-50 border-green-200 text-green-800',
};

const severityBadge: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

export function RiskPanel({ patientId, clinicId }: RiskPanelProps) {
  const [score, setScore] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRisk() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/intelligence/risk-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: clinicId, customer_id: patientId }),
        });

        if (!res.ok) throw new Error('Failed to fetch risk score');

        const data = await res.json();
        setScore(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchRisk();
  }, [patientId, clinicId]);

  if (loading) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-3">Risk Assessment</h3>
        <p className="text-gray-500">Analyzing patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-3">Risk Assessment</h3>
        <p className="text-gray-500">Unable to load risk assessment at this time.</p>
      </div>
    );
  }

  if (!score || score.flags.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="text-lg font-semibold mb-2 text-green-800">Risk Assessment</h3>
        <p className="text-green-700">No risk factors detected.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-6 ${severityStyles[score.overall_risk]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Risk Assessment</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityBadge[score.overall_risk]}`}>
          {score.overall_risk.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {score.flags.map((flag, i) => (
          <div key={i} className="bg-white/60 rounded-md p-3 border border-current/10">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm">{formatFlagType(flag.type)}</p>
              <span className={`text-xs px-2 py-0.5 rounded ${severityBadge[flag.severity]}`}>
                {flag.severity}
              </span>
            </div>
            <p className="text-sm mt-1 opacity-80">{flag.reason}</p>
            <p className="text-sm mt-1 font-medium">→ {flag.action}</p>
          </div>
        ))}
      </div>

      <p className="text-sm italic opacity-70">{score.recommendation}</p>
    </div>
  );
}

function formatFlagType(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
