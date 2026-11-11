import { Logger } from '@nestjs/common';
import { OrderCreatedEvent } from '../impl/order-created.event';
import { OrderCreatedHandler } from './order-created.handler';

describe('OrderCreatedHandler', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs only the event type and order id, never the full order payload', async () => {
    const logger = jest.spyOn(Logger, 'log').mockImplementation();
    const orderRepository = { updateOne: jest.fn().mockResolvedValue(undefined) };
    const handler = new OrderCreatedHandler(orderRepository as any);
    const event = new OrderCreatedEvent({
      id: 'order-123',
      address: '1 Private Street',
      paymentMethod: 'card-4242',
    });

    await handler.handle(event);

    expect(logger).toHaveBeenCalledWith('OrderCreated orderId=order-123', 'OrderCreatedEvent');
    expect(JSON.stringify(logger.mock.calls)).not.toContain('1 Private Street');
    expect(JSON.stringify(logger.mock.calls)).not.toContain('card-4242');
  });
});
