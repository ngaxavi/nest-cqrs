import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { greenBright } from 'cli-color';
import { OrderUpdatedEvent } from '../impl/order-updated.event';

@EventsHandler(OrderUpdatedEvent)
export class OrderUpdatedHandler implements IEventHandler<OrderUpdatedEvent> {
  handle(event: OrderUpdatedEvent) {
    Logger.log(greenBright(event, 'OrderUpdatedEvent'));
  }
}
