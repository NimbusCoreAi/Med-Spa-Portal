type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isProduction = process.env.NODE_ENV === 'production';

function formatContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    const lower = key.toLowerCase();
    if (lower.includes('key') || lower.includes('token') || lower.includes('secret') || lower.includes('password') || lower.includes('auth')) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function emit(entry: LogEntry): void {
  const sanitized = formatContext(entry.context);
  const payload: LogEntry = { ...entry, context: sanitized };

  if (isProduction) {
    process.stdout.write(JSON.stringify(payload) + '\n');
  } else {
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m',
      info: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    };
    const reset = '\x1b[0m';
    const prefix = `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset}`;
    const ctx = sanitized ? ` ${JSON.stringify(sanitized)}` : '';
    process.stdout.write(`${prefix} ${entry.message}${ctx}\n`);
    if (entry.error?.stack) {
      process.stdout.write(`  ${entry.error.stack}\n`);
    }
  }
}

export function logError(error: Error, context?: Record<string, unknown>): void {
  emit({
    level: 'error',
    message: error.message,
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  emit({
    level: 'info',
    message,
    timestamp: new Date().toISOString(),
    context,
  });
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  emit({
    level: 'warn',
    message,
    timestamp: new Date().toISOString(),
    context,
  });
}

export function logMetric(name: string, value: number, context?: Record<string, unknown>): void {
  emit({
    level: 'info',
    message: `metric:${name}`,
    timestamp: new Date().toISOString(),
    context: { ...context, metric: name, value },
  });
}
