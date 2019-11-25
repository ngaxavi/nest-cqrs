import { CreateOrderDto } from 'src/orders/dto';
import { ICommand } from '@nestjs/cqrs';

export class CreateOrderCommand implements ICommand {
  constructor(public readonly orderDto: CreateOrderDto) {}
}
