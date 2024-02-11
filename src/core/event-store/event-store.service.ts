import { Inject, Injectable, Logger, Type } from '@nestjs/common';
import { EventStore } from './event-store';
import { EVENT_STORE_PROVIDER } from './event-store.provider';
import { Subject } from 'rxjs';
import { AggregateRoot, IEventPublisher, IMessageSource } from '@nestjs/cqrs';
import { ConfigService } from '../config';
import {
  AppendExpectedRevision,
  END,
  ErrorType,
  EventData,
  EventStoreDBClient,
  FORWARDS,
  jsonEvent,
  JSONType,
  NO_STREAM,
  ResolvedEvent,
  START,
} from '@eventstore/db-client';
import { Event } from './models';
import { redBright } from 'cli-color';
import { v4 as uuid } from 'uuid';
import { EventStoreMapper } from './event-store.mapper';

@Injectable()
export class EventStoreService implements IEventPublisher<Event>, IMessageSource<Event> {
  private readonly eventStoreClient: EventStoreDBClient;

  constructor(
    @Inject(EVENT_STORE_PROVIDER) private eventStore: EventStore,
    private config: ConfigService,
    private readonly mapper: EventStoreMapper,
  ) {
    const eventStoreConfig = this.config.getEventStore();
    this.eventStoreClient = EventStoreDBClient.connectionString(eventStoreConfig.uri);
  }

  async publishAll<T extends Event>(events: T[]) {
    if (!events?.length) {
      return;
    }
    const streamName = this.getStreamName(events[0]);
    const expectedRevision = this.getExpectedRevision(events[0]);

    const eventsData = [];

    for (const event of events) {
      const eventData = await this.createEventData(event);
      eventsData.push(eventData);
    }

    try {
      this.eventStoreClient.appendToStream(streamName, eventsData, { expectedRevision });
    } catch (err) {
      // log
      Logger.error(redBright(`Error publishing all events: ${err.message}`));
    }
  }

  async publish<T extends Event>(event: T) {
    const streamName = this.getStreamName(event);
    const expectedRevision = this.getExpectedRevision(event);

    const eventData = await this.createEventData(event);

    try {
      await this.eventStoreClient.appendToStream(streamName, eventData, {
        expectedRevision,
      });
    } catch (err) {
      Logger.error(redBright(`Error publishing event: ${err.message}`));
    }
  }

  async read<T extends AggregateRoot>(aggregate: Type<T>, id: string): Promise<T> | null {
    const streamName = `${aggregate.name}-${id}`;

    try {
      const entity = <T>Reflect.construct(aggregate, []);
      const resolvedEvents = await this.eventStoreClient.readStream(streamName, {
        direction: FORWARDS,
        fromRevision: START,
      });

      const events = [] as Event[];

      for await (const event of resolvedEvents) {
        events.push(await this.mapper.resolvedEventToDomainEvent(event));
      }

      entity.loadFromHistory(events);

      return entity;
    } catch (error) {
      if (error?.type === ErrorType.STREAM_NOT_FOUND) {
        return null;
      }

      Logger.error(error);
    }

    return null;
  }

  /**
   * @description Event Store bridge subscribes to domain category stream
   * @param subject
   */
  async bridgeEventsTo<T extends Event>(subject: Subject<T>) {
    const onEvent = async (resolvedEvent: ResolvedEvent) => {
      if (resolvedEvent.event?.type.startsWith('$')) {
        return;
      }

      subject.next(<T>await this.mapper.resolvedEventToDomainEvent(resolvedEvent));
    };

    try {
      await this.eventStoreClient
        .subscribeToAll({
          fromPosition: END,
        })
        .on('data', onEvent);
    } catch (error) {
      Logger.error(error);
    }
  }

  setEventHandlers(eventHandlers: { [k: string]: any }) {
    this.eventHandlers = eventHandlers;
  }

  private getStreamName<T extends Event>(event: T) {
    return `${event.stream}-${event.aggregateId}`;
  }

  private getExpectedRevision<T extends Event>(event: T): AppendExpectedRevision {
    return event.version <= 0 ? NO_STREAM : BigInt(event.version - 1);
  }

  private async createEventData<T extends Event>(event: T): Promise<EventData> {
    if (event.aggregateEncrypted) {
      event = (await this.keyService.encryptEvent(event)) as T;
    }

    return jsonEvent({
      id: uuid(),
      type: event.eventType,
      data: event.payload as JSONType,
      metadata: event.metadata,
    });
  }
}
