import { ICommand } from '@nestjs/cqrs';
import { UpdateOrderDto } from 'src/orders/dto';

export class UpdateOrderCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly orderDto: UpdateOrderDto,
  ) {}
}
