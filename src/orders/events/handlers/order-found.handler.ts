import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { greenBright } from 'cli-color';
import { OrderFoundEvent } from '../impl/order-found.event';

@EventsHandler(OrderFoundEvent)
export class OrderFoundHandler implements IEventHandler<OrderFoundEvent> {
  handle(event: OrderFoundEvent) {
    Logger.log(greenBright(event, 'OrderFoundEvent'));
  }
}
