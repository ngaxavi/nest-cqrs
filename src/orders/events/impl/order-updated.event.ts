import { IEvent } from '@nestjs/cqrs';
import { UpdateOrderDto } from 'src/orders/dto';

export class OrderUpdatedEvent implements IEvent {
  constructor(public readonly orderDto: UpdateOrderDto) {}
}
