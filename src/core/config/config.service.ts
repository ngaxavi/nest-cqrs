import { v4 as uuid } from 'uuid';

export interface Config {
  id: string;
  env: string;
  name: string;
  prefix: string;
  port: number;
  mongo: MongoConfig;
  eventStore: EventStoreConfig;
}

export interface MongoConfig {
  uri: string;
  useCreateIndex?: boolean;
  useFindAndModify?: boolean;
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
}

export interface EventStoreConfig {
  uri: string;
  hostname: string;
  tcpPort: number;
  credentials: {
    username: string;
    password: string;
  };
  poolOptions: {
    min: number;
    max: number;
  };
}

export interface MongoEnv {
  database?: string;
  user?: string;
  password?: string;
  host?: string;
  port?: string;
  uri?: string;
  credentials?: {
    uri?: string;
  };
}

export interface EventStoreEnv {
  protocol?: string;
  host?: string;
  tcpPort?: number;
  httpPort?: number;
  uri?: string;
  credentials: {
    username: string;
    password: string;
  };
  poolOptions?: {
    min: number;
    max: number;
  };
}

export interface ConfigEnv {
  name: string;
  prefix: string;
  port: number;
  mongo?: MongoEnv;
  eventStore?: EventStoreEnv;
}

export class ConfigService {
  private readonly config: Config;

  constructor(envs: { [k: string]: ConfigEnv }) {
    if (!envs) {
      throw new Error('No Service Config provided');
    }
    const envKey = process.env.PROD_ENV || 'development';
    const env: ConfigEnv = envs[envKey];
    if (!env) {
      throw new Error(`No Service Config for ${envKey} environment provided`);
    }

    // Mongo
    env.mongo = env.mongo || {};
    const mongo: MongoConfig = {
      uri: process.env.MONGO_URI || '',
    };
    if (env.mongo.credentials && env.mongo.credentials.uri) {
      mongo.uri = env.mongo.credentials.uri || process.env.MONGO_URI || '';
    } else {
      const user = process.env.MONGO_USER || env.mongo.user;
      const password = process.env.MONGO_PASSWORD || env.mongo.password;
      const credentials = user && password ? `${user}:${password}@` : '';
      const host = process.env.MONGO_HOST || env.mongo.host || 'localhost';
      const port = process.env.MONGO_PORT || env.mongo.port || '27017';
      const database = process.env.MONGO_DB || env.mongo.database || '';
      mongo.uri =
        process.env.MONGO_URI ||
        env.mongo.uri ||
        `mongodb://${credentials}${host}:${port}/${database}`;
    }

    // Event Store
    const eventStore: EventStoreConfig = {
      uri: process.env.EVENT_STORE_URI || '',
      hostname: process.env.EVENT_STORE_HOTSNAME || 'localhost',
      tcpPort: +process.env.EVENT_STORE_TCP_PORT || 1113,
      credentials: {
        username:
          process.env.EVENT_STORE_CREDENTIALS_USERNAME ||
          env.eventStore.credentials.username,
        password:
          process.env.EVENT_STORE_CREDENTIALS_PASSWORD ||
          env.eventStore.credentials.password,
      },
      poolOptions: {
        min: +process.env.EVENT_STORE_POOLOPTIONS_MIN || 1,
        max: +process.env.EVENT_STORE_POOLOPTIONS_MAX || 10,
      },
    };

    const protocol =
      process.env.EVENT_STORE_PROTOCOL || env.eventStore.protocol || 'http';
    const hostname =
      process.env.EVENT_STORE_HOSTNAME || env.eventStore.host || 'localhost';
    const httpPort =
      process.env.EVENT_STORE_HTTP_PORT || env.eventStore.httpPort || '2113';
    eventStore.uri =
      process.env.EVENT_STORE_URI ||
      env.eventStore.uri ||
      `${protocol}://${hostname}:${httpPort}`;

    this.config = {
      id: uuid(),
      name: env.name || '',
      port: +process.env.PORT || env.port || 3000,
      prefix: process.env.PREFIX || env.prefix || '',
      env: process.env.NODE_ENV || 'development',
      mongo,
      eventStore,
    };
  }

  public getConfig(): Config {
    return this.config;
  }

  public getEnvironment(): string {
    return this.config.env;
  }

  public getMongo(): MongoConfig {
    return this.config.mongo;
  }

  public getEventStore(): EventStoreConfig {
    return this.config.eventStore;
  }

  public getPort(): number {
    return this.config.port;
  }

  public getPrefix(): string {
    return this.config.prefix;
  }
}
