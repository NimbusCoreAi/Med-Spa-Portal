import type { PredictionModel, ChurnPrediction, TrainingData, ModelMetrics } from './types';
import type { RuleContext } from '../types';
import { evaluateRiskSync } from '../rules-engine/evaluate';

export class ChurnPredictor implements PredictionModel<RuleContext, ChurnPrediction> {
  readonly modelType = 'churn';
  isTrained = false;

  async train(_data: TrainingData): Promise<void> {
    this.isTrained = true;
  }

  async predict(input: RuleContext): Promise<ChurnPrediction> {
    if (!this.isTrained) {
      return this.heuristicFallback(input);
    }

    return this.heuristicFallback(input);
  }

  async evaluate(_testData: TrainingData): Promise<ModelMetrics> {
    return { accuracy: 0, precision: 0, recall: 0, f1: 0, sampleSize: 0 };
  }

  private heuristicFallback(ctx: RuleContext): ChurnPrediction {
    const score = evaluateRiskSync(ctx);
    const churnFlag = score.flags.find((f) => f.type === 'churn_risk');

    if (churnFlag) {
      const daysData = churnFlag.data?.days_since_last as number | undefined;
      return {
        probability: 0.65,
        confidence: 0.5,
        timeline: daysData ? `Likely to churn within ${Math.max(7, 90 - daysData)} days` : 'High churn risk detected',
      };
    }

    return {
      probability: 0.05,
      confidence: 0.3,
      timeline: 'No churn risk detected',
    };
  }
}
