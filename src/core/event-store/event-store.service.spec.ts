import { EventStoreService } from './event-store.service';
import { EventStore } from './event-store';
import { ConfigService } from '../config';

describe('EventStoreService', () => {
  it('preserves explicit TLS settings from the configured EventStore URI', () => {
    const eventStore = {
      connect: jest.fn(),
    } as unknown as EventStore;
    const config = {
      getEventStore: () => ({
        uri: 'http://eventstore.example.test:2113?tls=true',
        credentials: { username: 'admin', password: 'changeit' },
      }),
    } as ConfigService;

    new EventStoreService(eventStore, config);

    expect(eventStore.connect).toHaveBeenCalledWith('esdb://admin:changeit@eventstore.example.test:2113?tls=true');
  });
});
