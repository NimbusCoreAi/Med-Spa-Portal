export type {
  RiskLevel,
  RiskFlag,
  RiskScore,
  RuleContext,
  RuleEvaluator,
  AppointmentData,
  PaymentData,
  PackageData,
  AuditLogData,
} from './types';

export { SEVERITY_RANK, maxSeverity, recommendationFor } from './types';

export {
  evaluateRisk,
  evaluateRiskSync,
  buildRuleContext,
  defaultRules,
  type EvaluateRiskParams,
} from './rules-engine';

export {
  noShowRiskRule,
  churnRiskRule,
  revenueDropRule,
  packageAbandonmentRule,
  inventoryExpiryRule,
  followUpGapRule,
} from './rules-engine';

export type {
  PredictionModel,
  TrainingData,
  ModelMetrics,
  NoShowPrediction,
  ChurnPrediction,
  RevenuePrediction,
  FeatureExtractor,
} from './predictions';

export {
  NoShowPredictor,
  ChurnPredictor,
  RevenuePredictor,
  trainModel,
  evaluateModel,
  registerModel,
  getActiveModel,
  appointmentFeatures,
  paymentFeatures,
  engagementFeatures,
  allFeatureExtractors,
} from './predictions';
