import { IEvent } from '@nestjs/cqrs';
import { CreateOrderDto } from 'src/orders/dto';

export class OrderCreatedEvent implements IEvent {
  constructor(public readonly orderDto: CreateOrderDto) {}
}
