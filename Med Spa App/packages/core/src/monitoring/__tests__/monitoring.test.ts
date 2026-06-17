import { logError, logInfo, logWarn, logMetric } from '../index';

describe('monitoring', () => {
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  function getAllOutput(): string {
    return stdoutSpy.mock.calls.map((c: unknown[]) => c[0] as string).join('');
  }

  describe('logError', () => {
    it('writes error message', () => {
      const error = new Error('Test error message');
      error.name = 'TestError';
      logError(error);

      const output = getAllOutput();
      expect(output).toContain('Test error message');
    });

    it('includes stack trace', () => {
      const error = new Error('With stack');
      logError(error);

      const output = getAllOutput();
      expect(output).toContain('at ');
    });

    it('includes context when provided', () => {
      const error = new Error('With context');
      logError(error, { userId: '123', route: '/api/test' });

      const output = getAllOutput();
      expect(output).toContain('123');
      expect(output).toContain('/api/test');
    });
  });

  describe('logInfo', () => {
    it('writes the message', () => {
      logInfo('Test info message');
      const output = getAllOutput();
      expect(output).toContain('Test info message');
    });

    it('includes context when provided', () => {
      logInfo('Info', { action: 'signup', clinic: 'Test Clinic' });
      const output = getAllOutput();
      expect(output).toContain('signup');
      expect(output).toContain('Test Clinic');
    });
  });

  describe('logWarn', () => {
    it('writes the message', () => {
      logWarn('Test warning');
      const output = getAllOutput();
      expect(output).toContain('Test warning');
    });
  });

  describe('logMetric', () => {
    it('includes name and value', () => {
      logMetric('response_time_ms', 42);
      const output = getAllOutput();
      expect(output).toContain('response_time_ms');
      expect(output).toContain('42');
    });

    it('includes additional context', () => {
      logMetric('request_count', 100, { endpoint: '/api/health' });
      const output = getAllOutput();
      expect(output).toContain('/api/health');
      expect(output).toContain('100');
    });
  });

  describe('secret redaction', () => {
    it('redacts api keys in context', () => {
      logInfo('Test', { api_key: 'sk_test_12345' });
      const output = getAllOutput();
      expect(output).toContain('[REDACTED]');
      expect(output).not.toContain('sk_test_12345');
    });

    it('redacts tokens in context', () => {
      logInfo('Test', { authToken: 'secret-token' });
      const output = getAllOutput();
      expect(output).toContain('[REDACTED]');
      expect(output).not.toContain('secret-token');
    });

    it('redacts passwords in context', () => {
      logInfo('Test', { password: 'hunter2' });
      const output = getAllOutput();
      expect(output).toContain('[REDACTED]');
      expect(output).not.toContain('hunter2');
    });
  });
});
