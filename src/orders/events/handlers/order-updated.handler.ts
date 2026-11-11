import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderUpdatedEvent } from '../impl/order-updated.event';

@EventsHandler(OrderUpdatedEvent)
export class OrderUpdatedHandler implements IEventHandler<OrderUpdatedEvent> {
  handle(event: OrderUpdatedEvent) {
    Logger.log(`OrderUpdated orderId=${event.orderDto.id}`, 'OrderUpdatedEvent');
  }
}
