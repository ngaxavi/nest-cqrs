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
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses EVENT_STORE_HOSTNAME for the TCP hostname', () => {
    process.env.EVENT_STORE_HOSTNAME = 'eventstore.local';

    const service = new ConfigService(envs);

    expect(service.getEventStore().hostname).toBe('eventstore.local');
  });
});
