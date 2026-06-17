import type { PredictionModel, RevenuePrediction, TrainingData, ModelMetrics } from './types';
import type { RuleContext } from '../types';
import { evaluateRiskSync } from '../rules-engine/evaluate';

export class RevenuePredictor implements PredictionModel<RuleContext, RevenuePrediction> {
  readonly modelType = 'revenue';
  isTrained = false;

  async train(_data: TrainingData): Promise<void> {
    this.isTrained = true;
  }

  async predict(input: RuleContext): Promise<RevenuePrediction> {
    if (!this.isTrained) {
      return this.heuristicFallback(input);
    }

    return this.heuristicFallback(input);
  }

  async evaluate(_testData: TrainingData): Promise<ModelMetrics> {
    return { accuracy: 0, precision: 0, recall: 0, f1: 0, sampleSize: 0 };
  }

  private heuristicFallback(ctx: RuleContext): RevenuePrediction {
    const score = evaluateRiskSync(ctx);
    const revenueFlag = score.flags.find((f) => f.type === 'revenue_drop');

    const recentPayments = ctx.payments.filter((p) => p.status === 'completed');
    const projected = recentPayments.reduce((sum, p) => sum + p.amount, 0);

    if (revenueFlag) {
      return {
        projected: Math.round(projected * 100) / 100,
        confidence: 0.4,
        trend: 'down',
      };
    }

    return {
      projected: Math.round(projected * 100) / 100,
      confidence: 0.3,
      trend: 'flat',
    };
  }
}
