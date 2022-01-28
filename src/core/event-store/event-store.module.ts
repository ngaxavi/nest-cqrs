import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigEnv, ConfigService } from '../config';
import { eventStoreProviders, EVENT_STORE_CONFIG, EVENT_STORE_CONFIG_USE_ENV } from './event-store.provider';
import { EventStoreService } from './event-store.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  providers: [
    ...eventStoreProviders,
    {
      provide: EVENT_STORE_CONFIG,
      useValue: EVENT_STORE_CONFIG_USE_ENV,
    },
  ],
  exports: [
    ...eventStoreProviders,
    {
      provide: EVENT_STORE_CONFIG,
      useValue: EVENT_STORE_CONFIG_USE_ENV,
    },
  ],
})
export class EventStoreModule {
  static forRoot(config: { [k: string]: ConfigEnv }): DynamicModule {
    return {
      module: EventStoreModule,
      providers: [
        {
          provide: ConfigService,
          useValue: new ConfigService(config),
        },
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: EventStoreModule,
      providers: [EventStoreService],
      exports: [EventStoreService],
    };
  }
}
