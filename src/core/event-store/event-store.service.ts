import { Injectable, Inject, HttpService, Logger } from '@nestjs/common';
import { EventStore } from './event-store';
import { EVENT_STORE_PROVIDER } from './event-store.provider';
import { Subject } from 'rxjs';
import { IEvent, IMessageSource, IEventPublisher } from '@nestjs/cqrs';
import { parseString } from 'xml2js';
import { AxiosResponse } from 'axios';
import { ConfigService } from '../config';

@Injectable()
export class EventStoreService implements IEventPublisher, IMessageSource {
  private eventHandlers: { [k: string]: any };
  private eventStoreHostUrl: string;
  private category: string;

  constructor(
    @Inject(EVENT_STORE_PROVIDER) private eventStore: EventStore,
    private http: HttpService,
    private config: ConfigService,
  ) {
    const eventStoreConfig = this.config.getEventStore();
    this.eventStoreHostUrl = `${eventStoreConfig.uri}/streams/`;
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

    const onEvent = async event => {
      const eventUrl = `${this.eventStoreHostUrl}/${event.metadata.$o}/${
        event.data.split('@')[0]
      }`;
      const res: AxiosResponse<any> = await this.http.get(eventUrl).toPromise();
      parseString(res.data, (err, result) => {
        if (err) {
          Logger.error(err);
          return;
        }
        const content = result['atom:entry']['atom:content'][0];
        const eventType = content.eventType[0];
        const data = content.data[0];
        event = this.eventHandlers[eventType](...Object.values(data));
        subject.next(event);
      });
    };

    const onDropped = (subscription, reason, error) => {
      Logger.log(subscription, reason, error);
    };

    try {
      await this.eventStore
        .getClient()
        .subscribeToStream(streamName, onEvent, onDropped, false);
    } catch (err) {
      Logger.error(err);
    }
  }

  setEventHandlers(eventHandlers: { [k: string]: any }) {
    this.eventHandlers = eventHandlers;
  }
}
