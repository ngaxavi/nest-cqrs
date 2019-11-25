import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { greenBright } from 'cli-color';
import { OrderDeletedEvent } from '../impl/order-deleted.event';

@EventsHandler(OrderDeletedEvent)
export class OrderDeletedHandler implements IEventHandler<OrderDeletedEvent> {
  handle(event: OrderDeletedEvent) {
    Logger.log(greenBright(event, 'OrderDeletedEvent'));
  }
}
