import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { OrderCreatedEvent } from '../impl/order-created.event';
import { Logger } from '@nestjs/common';
import { cyan } from 'cli-color';
import { OrdersRepository } from '../../orders.repository';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  constructor(private readonly orderRepository: OrdersRepository) {}

  async handle(event: OrderCreatedEvent) {
    Logger.log(cyan(JSON.stringify(event), 'OrderCreatedEvent'));

    const id = event.orderDto.id;
    await this.orderRepository.updateOne(id, { status: 'DELIVERED' });
  }
}
