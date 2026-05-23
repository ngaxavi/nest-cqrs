import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventStore } from './event-store';
import { EVENT_STORE_PROVIDER } from './event-store.provider';
import { Subject } from 'rxjs';
import { IEvent, IEventPublisher, IMessageSource } from '@nestjs/cqrs';
import { ConfigService } from '../config';

@Injectable()
export class EventStoreService implements IEventPublisher, IMessageSource {
  private eventHandlers: { [k: string]: any };
  private readonly category: string;

  constructor(
    @Inject(EVENT_STORE_PROVIDER) private eventStore: EventStore,
    private config: ConfigService,
  ) {
    const eventStoreConfig = this.config.getEventStore();
    this.category = 'orders';
    this.eventStore.connect(this.toConnectionString(eventStoreConfig.uri, eventStoreConfig.credentials));
  }

  async publish<T extends IEvent>(event: T) {
    const message = JSON.parse(JSON.stringify(event));
    const orderId = message.id || message.orderDto?._id || message.orderDto?.id;
    const streamName = `${this.category}-${orderId}`;
    const type = event.constructor.name;
    try {
      await this.eventStore.getClient().appendToStream(streamName, this.eventStore.newEvent(type, message));
    } catch (err) {
      Logger.error(err);
    }
  }

  /**
   * @description Event Store bridge subscribes to domain category stream
   * @param subject
   */
  async bridgeEventsTo<T extends IEvent>(subject: Subject<T>) {
    const streamName = `$ce-${this.category}`;

    try {
      const subscription = this.eventStore.getClient().subscribeToStream(streamName, { resolveLinkTos: true });

      (async () => {
        for await (const resolvedEvent of subscription) {
          const persistedEvent = resolvedEvent.event;
          if (!persistedEvent) {
            continue;
          }

          const eventHandler = this.eventHandlers[persistedEvent.type];
          if (!eventHandler) {
            continue;
          }

          const data = persistedEvent.data as any;
          subject.next(eventHandler(data.orderDto ?? data.id ?? data));
        }
      })().catch((err) => Logger.error(err));
    } catch (err) {
      Logger.error(err);
    }
  }

  setEventHandlers(eventHandlers: { [k: string]: any }) {
    this.eventHandlers = eventHandlers;
  }

  private toConnectionString(uri: string, credentials: { username: string; password: string }) {
    const eventStoreUrl = new URL(uri);
    eventStoreUrl.protocol = 'esdb:';
    eventStoreUrl.username = credentials.username;
    eventStoreUrl.password = credentials.password;
    eventStoreUrl.searchParams.set('tls', 'false');
    return eventStoreUrl.toString();
  }
}
