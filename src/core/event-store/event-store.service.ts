import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventStore } from './event-store';
import { EVENT_STORE_PROVIDER } from './event-store.provider';
import { lastValueFrom, Subject } from 'rxjs';
import { IEvent, IEventPublisher, IMessageSource } from '@nestjs/cqrs';
import { XMLParser } from 'fast-xml-parser';
import { AxiosResponse } from 'axios';
import { ConfigService } from '../config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class EventStoreService implements IEventPublisher, IMessageSource {
  private eventHandlers: { [k: string]: any };
  private readonly eventStoreHostUrl: string;
  private readonly category: string;

  constructor(
    @Inject(EVENT_STORE_PROVIDER) private eventStore: EventStore,
    private http: HttpService,
    private config: ConfigService,
  ) {
    const eventStoreConfig = this.config.getEventStore();
    this.eventStoreHostUrl = `${eventStoreConfig.uri}/streams`;
    this.category = 'orders';
    this.eventStore.connect({
      hostname: eventStoreConfig.hostname,
      port: eventStoreConfig.tcpPort,
      credentials: eventStoreConfig.credentials,
      poolOptions: eventStoreConfig.poolOptions,
    });
  }

  async publish<T extends IEvent>(event: T) {
    const message = JSON.parse(JSON.stringify(event));
    const orderId = message.id || message.orderDto._id;
    const streamName = `${this.category}-${orderId}`;
    const type = event.constructor.name;
    try {
      await this.eventStore.getClient().writeEvent(streamName, type, event);
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

    const onEvent = async (subscription, event) => {
      const eventUrl = `${this.eventStoreHostUrl}/${event.metadata.$o}/${event.data.split('@')[0]}`;
      const res: AxiosResponse<any> = await lastValueFrom<any>(
        this.http.get(eventUrl, {
          headers: {
            Accept: '*/*',
          },
          responseType: 'text',
        }),
      );
      try {
        const parser = new XMLParser();
        const result = parser.parse(res.data);

        const content = result['atom:entry']['atom:content'];
        const eventType = content.eventType;
        const data = content.data;
        event = this.eventHandlers[eventType](...Object.values(data));
        subject.next(event);
      } catch (err) {
        Logger.error(err);
      }
    };

    const onDropped = (subscription, reason, error) => {
      Logger.log(subscription, reason, error);
    };

    try {
      await this.eventStore.getClient().subscribeToStream(streamName, onEvent, onDropped, false);
    } catch (err) {
      Logger.error(err);
    }
  }

  setEventHandlers(eventHandlers: { [k: string]: any }) {
    this.eventHandlers = eventHandlers;
  }
}
