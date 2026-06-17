export interface PredictionModel<TInput = unknown, TOutput = unknown> {
  readonly modelType: string;
  isTrained: boolean;
  train(data: TrainingData<TInput>): Promise<void>;
  predict(input: TInput): Promise<TOutput>;
  evaluate(testData: TrainingData<TInput>): Promise<ModelMetrics>;
}

export interface TrainingData<TInput = unknown> {
  inputs: TInput[];
  labels: unknown[];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  sampleSize: number;
}

export interface NoShowPrediction {
  probability: number;
  confidence: number;
  factors: string[];
}

export interface ChurnPrediction {
  probability: number;
  confidence: number;
  timeline: string;
}

export interface RevenuePrediction {
  projected: number;
  confidence: number;
  trend: 'up' | 'down' | 'flat';
}

export interface FeatureExtractor<TInput = unknown> {
  name: string;
  extract(ctx: import('../types').RuleContext): number[];
}

export interface ModelRegistryEntry {
  modelType: string;
  model: PredictionModel;
  registeredAt: Date;
}

export const modelRegistry = new Map<string, ModelRegistryEntry>();

export function registerModel(modelType: string, model: PredictionModel): void {
  modelRegistry.set(modelType, {
    modelType,
    model,
    registeredAt: new Date(),
  });
}

export function getActiveModel(modelType: string): PredictionModel | undefined {
  return modelRegistry.get(modelType)?.model;
}
