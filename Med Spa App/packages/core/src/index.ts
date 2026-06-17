// Clinics module
export { getClinic } from './clinics';

// Auth module
export { login, signUp, logout } from './auth';
export type { LoginParams, SignUpParams } from './auth';

// RBAC module
export { getPermissions, canPerform } from './rbac';
export type { Role, Permission } from './rbac';

// Audit Logs module
export { logAction, getAuditLogs } from './audit-logs';
export type { LogActionParams } from './audit-logs';

// Encryption module
export { encryptData, decryptData, generateKey } from './encryption';

// Config module
export { getSupabaseConfig, getSupabaseServiceConfig, getAnonSupabaseClient, getServiceSupabaseClient, isPhiEnabled } from './config';
export type { SupabaseConfig, SupabaseServiceConfig } from './config';

// Intake forms module
export {
  createIntakeForm,
  getIntakeForms,
  getIntakeForm,
  updateIntakeForm,
  submitIntake,
  getIntakeSubmissions,
  getIntakeStatusForAppointment
} from './intake';
export type { CreateIntakeFormParams, SubmitIntakeParams } from './intake';

// Patients module
export { findOrCreatePatient, getPatients } from './patients';
export type { FindOrCreatePatientParams } from './patients';

// Scheduling module
export {
  createProvider,
  getProviders,
  createRoom,
  getRooms,
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  setAppointmentPaymentLink,
  updateAppointmentPaymentStatus,
  getAvailableSlots
} from './scheduling';
export type {
  CreateProviderParams,
  CreateRoomParams,
  CreateAppointmentParams,
  GetAppointmentsParams,
  GetAvailableSlotsParams
} from './scheduling';

export { getDashboardMetrics } from './reporting';
export type { DashboardMetrics, GetDashboardMetricsParams } from './reporting';

// Errors module
export { AppError, ValidationError, AuthError, ForbiddenError, NotFoundError, ConflictError, PaymentError, errorToResponse, errorToStatus } from './errors';

// Bookings module
export { bookAppointment } from './bookings';
export type { BookAppointmentParams, BookAppointmentResult } from './bookings';

// Availability module
export { generateTimeSlots, isSlotAvailable, filterAvailableSlots, parseAvailabilityConfig } from './availability';
export type { TimeSlot, AvailabilityRange } from './availability';

// Notifications module
export { sendAppointmentConfirmation } from './notifications';
export type { SendConfirmationParams, NotificationResult, EmailService, SmsService } from './notifications';

// Utils module
export { snakeToCamel, camelToSnake, formatDate, formatTime, formatDateTime, formatCurrency, cn, getDateRange } from './utils';
export type { DateRangePreset } from './utils';

// Monitoring module
export { logError, logInfo, logWarn, logMetric } from './monitoring';

// Billing module
export {
  getSubscription,
  getSubscriptionStatus,
  updateSubscriptionStatus,
  hasActiveSubscription,
  createCheckoutSession,
  createBillingPortalSession,
  getStripeWebhookEvent,
} from './billing';
export type { Plan, SubscriptionStatus, SubscriptionRecord } from './billing';

// Packages module
export { deductPackageSession, getPatientPackages } from './packages';
export type { DeductPackageParams, DeductPackageResult } from './packages';

// Shared types
export type {
  Clinic,
  Staff,
  Patient,
  AuditLog,
  UserContext,
  IntakeFormField,
  IntakeForm,
  IntakeSubmission,
  IntakeStatus,
  Provider,
  Room,
  Appointment,
  AppointmentStatus,
  PaymentStatus
} from './types';

export type { Tenant, Customer, Resource, Space } from './types';
export type { CreditPackage, PackageTransaction } from './types';
