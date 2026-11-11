import { ConfigEnv } from './core/config';

const env: { [k: string]: ConfigEnv } = {
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
env.production = {
  name: 'orders-service',
  prefix: 'api',
  port: 3000,
  mongo: {},
  eventStore: {},
};
export const config: { [k: string]: ConfigEnv } = env;
