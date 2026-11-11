import { ConfigEnv, ConfigService } from './config.service';

const envs: { [k: string]: ConfigEnv } = {
  development: {
    name: 'orders-service',
    prefix: 'api',
    port: 3000,
    mongo: {
      database: 'orders',
    },
    eventStore: {
      credentials: {
        username: 'admin',
        password: 'changeit',
      },
    },
  },
};

describe('ConfigService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    for (const name of [
      'NODE_ENV',
      'PROD_ENV',
      'EVENT_STORE_URI',
      'EVENT_STORE_CREDENTIALS_USERNAME',
      'EVENT_STORE_CREDENTIALS_PASSWORD',
      'EVENT_STORE_HOSTNAME',
    ]) {
      delete process.env[name];
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses EVENT_STORE_HOSTNAME for the TCP hostname', () => {
    process.env.EVENT_STORE_HOSTNAME = 'eventstore.local';

    const service = new ConfigService(envs);

    expect(service.getEventStore().hostname).toBe('eventstore.local');
  });

  it('retains development-only EventStore credential and URI defaults', () => {
    const service = new ConfigService(envs);

    expect(service.getEventStore()).toMatchObject({
      uri: 'http://localhost:2113',
      credentials: { username: 'admin', password: 'changeit' },
    });
  });

  it('requires EventStore URI and credentials in production without exposing secret values', () => {
    process.env.NODE_ENV = 'production';
    process.env.EVENT_STORE_CREDENTIALS_PASSWORD = 'do-not-leak';

    expect(() => new ConfigService({ ...envs, production: envs.development })).toThrow(
      'Missing required production EventStore configuration',
    );

    try {
      new ConfigService({ ...envs, production: envs.development });
    } catch (error) {
      expect((error as Error).message).not.toContain('do-not-leak');
    }
  });

  it.each(['http://eventstore.local:2113?tls=true', 'esdb://eventstore.local:2113?tls=false'])(
    'rejects insecure production EventStore URI %s',
    (uri) => {
      process.env.NODE_ENV = 'production';
      process.env.EVENT_STORE_URI = uri;
      process.env.EVENT_STORE_CREDENTIALS_USERNAME = 'service-user';
      process.env.EVENT_STORE_CREDENTIALS_PASSWORD = 'service-password';

      expect(() => new ConfigService({ ...envs, production: envs.development })).toThrow(
        'Production EventStore URI must use TLS',
      );
    },
  );

  it('accepts an esdb production URI unless TLS is explicitly disabled', () => {
    process.env.NODE_ENV = 'production';
    process.env.EVENT_STORE_URI = 'esdb://eventstore.local:2113';
    process.env.EVENT_STORE_CREDENTIALS_USERNAME = 'service-user';
    process.env.EVENT_STORE_CREDENTIALS_PASSWORD = 'service-password';

    expect(() => new ConfigService({ ...envs, production: envs.development })).not.toThrow();
  });

  it('uses PROD_ENV over conflicting NODE_ENV when enforcing production configuration', () => {
    process.env.PROD_ENV = 'production';
    process.env.NODE_ENV = 'development';

    expect(() => new ConfigService({ ...envs, production: envs.development })).toThrow(
      'Missing required production EventStore configuration',
    );
  });

  it('treats PROD_ENV as the authoritative selected environment', () => {
    process.env.PROD_ENV = 'production';
    process.env.EVENT_STORE_URI = 'esdb://eventstore.local:2113?tls=true';
    process.env.EVENT_STORE_CREDENTIALS_USERNAME = 'service-user';
    process.env.EVENT_STORE_CREDENTIALS_PASSWORD = 'service-password';

    const service = new ConfigService({ ...envs, production: envs.development });

    expect(service.getEnvironment()).toBe('production');
  });

  it('accepts a TLS-enabled production EventStore URI with explicit credentials', () => {
    process.env.NODE_ENV = 'production';
    process.env.EVENT_STORE_URI = 'esdb://eventstore.local:2113?tls=true';
    process.env.EVENT_STORE_CREDENTIALS_USERNAME = 'service-user';
    process.env.EVENT_STORE_CREDENTIALS_PASSWORD = 'service-password';

    const service = new ConfigService({ ...envs, production: envs.development });

    expect(service.getEventStore()).toMatchObject({
      uri: 'esdb://eventstore.local:2113?tls=true',
      credentials: { username: 'service-user', password: 'service-password' },
    });
  });
});
