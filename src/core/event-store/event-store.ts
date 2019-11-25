import { EventFactory, TCPClient, TCPConfig } from 'geteventstore-promise';

export interface EventStoreMessage {
  streamId: string;
  eventId: string;
  eventNumber: number;
  eventType: number;
  createdAt: Date;
  metadata: object;
  isJson: boolean;
  data: object;
}

export class EventStore {
  private eventFactory: EventFactory;
  private client: TCPClient;
  private type: string;

  constructor() {
    this.type = 'event-store';
    this.eventFactory = new EventFactory();
  }

  connect(config: TCPConfig) {
    this.client = new TCPClient(config);
    return this;
  }

  getClient() {
    return this.client;
  }

  newEvent(eventType: string, data: object) {
    return this.eventFactory.newEvent(eventType, data);
  }

  close() {
    this.client.close();
    return this;
  }
}
