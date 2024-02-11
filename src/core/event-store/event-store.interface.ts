import { EventStoreConfig } from '../config';
import { ClassProvider, ExistingProvider, FactoryProvider } from '@nestjs/common';

export type EventStoreModuleAsyncOptions =
  | Omit<ClassProvider<EventStoreConfig>, 'provide'>
  | Omit<ExistingProvider<EventStoreConfig>, 'provide'>
  | Omit<FactoryProvider<EventStoreConfig>, 'provide'>;

export type Transformer = (event: Event) => Event;

export type TransformerRepo = Record<string, Transformer>;
