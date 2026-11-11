import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';

function contextWithApiKey(value?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: value === undefined ? {} : { 'x-api-key': value } }),
    }),
  } as ExecutionContext;
}

describe('ApiKeyGuard', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.API_KEY;
    delete process.env.NODE_ENV;
    delete process.env.PROD_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows development compatibility when API_KEY is not configured', () => {
    const guard = new ApiKeyGuard();

    expect(guard.canActivate(contextWithApiKey())).toBe(true);
  });

  it('requires API_KEY configuration when PROD_ENV selects production', () => {
    process.env.PROD_ENV = 'production';

    expect(() => new ApiKeyGuard()).toThrow('API_KEY is required in production');
  });

  it('requires API_KEY configuration in production', () => {
    process.env.NODE_ENV = 'production';

    expect(() => new ApiKeyGuard()).toThrow('API_KEY is required in production');
  });

  it.each([undefined, 'wrong', 'a-much-longer-wrong-key'])(
    'rejects a missing or wrong x-api-key (%s)',
    (providedKey) => {
      process.env.API_KEY = 'expected-key';
      const guard = new ApiKeyGuard();

      expect(() => guard.canActivate(contextWithApiKey(providedKey))).toThrow(UnauthorizedException);
    },
  );

  it('accepts the configured x-api-key', () => {
    process.env.API_KEY = 'expected-key';
    const guard = new ApiKeyGuard();

    expect(guard.canActivate(contextWithApiKey('expected-key'))).toBe(true);
  });
});
