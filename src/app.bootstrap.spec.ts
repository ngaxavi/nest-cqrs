import { INestApplication, ValidationPipe } from '@nestjs/common';
import { configureApplication, parseCorsOrigins } from './app.bootstrap';
import { ConfigService } from './core/config';

describe('application bootstrap configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('parses comma-separated CORS origins and removes empty entries', () => {
    expect(parseCorsOrigins(' https://one.example,https://two.example, ')).toEqual([
      'https://one.example',
      'https://two.example',
    ]);
  });

  it('configures the global prefix, strict validation, and CORS allowlist', () => {
    process.env.CORS_ORIGINS = 'https://one.example, https://two.example';
    const useGlobalPipes = jest.fn();
    const enableCors = jest.fn();
    const setGlobalPrefix = jest.fn();
    const app = { useGlobalPipes, enableCors, setGlobalPrefix } as unknown as INestApplication;
    const configService = {
      getPrefix: () => 'api',
      getEnvironment: () => 'development',
    } as ConfigService;

    configureApplication(app, configService);

    expect(setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(enableCors).toHaveBeenCalledWith({
      origin: ['https://one.example', 'https://two.example'],
    });
    const pipe = useGlobalPipes.mock.calls[0][0] as ValidationPipe;
    expect((pipe as any).validatorOptions).toMatchObject({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect((pipe as any).isTransformEnabled).toBe(true);
  });

  it('rejects missing CORS_ORIGINS in production before configuration is applied', () => {
    delete process.env.CORS_ORIGINS;
    const app = {
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
      setGlobalPrefix: jest.fn(),
    } as unknown as INestApplication;
    const configService = {
      getPrefix: () => 'api',
      getEnvironment: () => 'production',
    } as ConfigService;

    expect(() => configureApplication(app, configService)).toThrow('CORS_ORIGINS is required in production');
    expect(app.enableCors).not.toHaveBeenCalled();
  });
});
