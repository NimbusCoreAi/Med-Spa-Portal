import type { PredictionModel, NoShowPrediction, TrainingData, ModelMetrics } from './types';
import type { RuleContext } from '../types';
import { evaluateRiskSync } from '../rules-engine/evaluate';

export class NoShowPredictor implements PredictionModel<RuleContext, NoShowPrediction> {
  readonly modelType = 'no-show';
  isTrained = false;

  async train(_data: TrainingData): Promise<void> {
    this.isTrained = true;
  }

  async predict(input: RuleContext): Promise<NoShowPrediction> {
    if (!this.isTrained) {
      return this.heuristicFallback(input);
    }

    return this.heuristicFallback(input);
  }

  async evaluate(_testData: TrainingData): Promise<ModelMetrics> {
    return { accuracy: 0, precision: 0, recall: 0, f1: 0, sampleSize: 0 };
  }

  private heuristicFallback(ctx: RuleContext): NoShowPrediction {
    const score = evaluateRiskSync(ctx);
    const noShowFlag = score.flags.find((f) => f.type === 'no_show_risk');

    if (noShowFlag) {
      return {
        probability: 0.7,
        confidence: 0.5,
        factors: [noShowFlag.reason],
      };
    }

    return {
      probability: 0.1,
      confidence: 0.3,
      factors: [],
    };
  }
}
