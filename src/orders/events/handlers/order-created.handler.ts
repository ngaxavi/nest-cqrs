import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { OrderCreatedEvent } from '../impl/order-created.event';
import { Logger } from '@nestjs/common';
import { greenBright } from 'cli-color';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  handle(event: OrderCreatedEvent) {
    Logger.log(greenBright(event, 'OrderCreatedEvent'));
  }
}
