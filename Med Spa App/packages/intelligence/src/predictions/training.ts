import type { PredictionModel, TrainingData, ModelMetrics } from './types';
import { modelRegistry, registerModel, getActiveModel } from './types';

export interface TrainModelParams {
  modelType: string;
  data: TrainingData;
  model?: PredictionModel;
}

export async function trainModel(params: TrainModelParams): Promise<PredictionModel> {
  const model = params.model ?? getActiveModel(params.modelType);

  if (!model) {
    throw new Error(`No model registered for type "${params.modelType}". Register a model first.`);
  }

  await model.train(params.data);
  registerModel(params.modelType, model);
  return model;
}

export async function evaluateModel(
  modelType: string,
  testData: TrainingData
): Promise<ModelMetrics> {
  const model = getActiveModel(modelType);
  if (!model) {
    throw new Error(`No model registered for type "${modelType}".`);
  }

  return model.evaluate(testData);
}

export { modelRegistry, registerModel, getActiveModel };
