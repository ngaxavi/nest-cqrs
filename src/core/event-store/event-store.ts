import { EventStoreDBClient, jsonEvent, JSONType } from '@eventstore/db-client';

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
  private client: EventStoreDBClient;
  private type: string;

  constructor() {
    this.type = 'event-store';
  }

  connect(connectionString: string) {
    this.client = EventStoreDBClient.connectionString(connectionString);
    return this;
  }

  getClient() {
    return this.client;
  }

  newEvent(eventType: string, data: object) {
    return jsonEvent({
      type: eventType,
      data: data as JSONType,
    });
  }

  async close() {
    await this.client.dispose();
    return this;
  }
}
