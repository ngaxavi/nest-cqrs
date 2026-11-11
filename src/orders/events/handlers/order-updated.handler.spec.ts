import { Logger } from '@nestjs/common';
import { OrderUpdatedEvent } from '../impl/order-updated.event';
import { OrderUpdatedHandler } from './order-updated.handler';

describe('OrderUpdatedHandler', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs only the event type and order id, never the full order payload', () => {
    const logger = jest.spyOn(Logger, 'log').mockImplementation();
    const handler = new OrderUpdatedHandler();
    const event = new OrderUpdatedEvent({
      id: 'order-123',
      address: '1 Private Street',
      paymentMethod: 'card-4242',
    });

    handler.handle(event);

    expect(logger).toHaveBeenCalledWith('OrderUpdated orderId=order-123', 'OrderUpdatedEvent');
    expect(JSON.stringify(logger.mock.calls)).not.toContain('1 Private Street');
    expect(JSON.stringify(logger.mock.calls)).not.toContain('card-4242');
  });
});
