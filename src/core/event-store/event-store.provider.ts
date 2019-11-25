import { EventStore } from './event-store';

export const EVENT_STORE_PROVIDER = 'EVENT_STORE_PROVIDER';
export const EVENT_STORE_CONFIG_USE_ENV = 'EVENT_STORE_CONFIG_USE_ENV';
export const EVENT_STORE_CONFIG = 'EVENT_STORE_CONFIG';

export const eventStoreProviders = [
  {
    provide: EVENT_STORE_PROVIDER,
    useFactory: (eventStoreConfig?: any): any => {
      if (eventStoreConfig === EVENT_STORE_CONFIG_USE_ENV) {
        return new EventStore();
      }
    },
    inject: [EVENT_STORE_CONFIG],
  },
];
