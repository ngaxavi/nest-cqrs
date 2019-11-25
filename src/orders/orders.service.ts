import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { CreateOrderCommand } from './commands/impl/create-order.command';
import { FindSingleOrderQuery } from './queries/impl/find-single-order.query';
import { FindManyOrdersQuery } from './queries/impl/find-many-orders.query';
import { UpdateOrderCommand } from './commands/impl/update-order.command';
import { DeleteOrderCommand } from './commands/impl/delete-order.command';

@Injectable()
export class OrdersService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    return this.commandBus.execute(new CreateOrderCommand(dto));
  }

  async findOne(id: string) {
    return this.queryBus.execute(new FindSingleOrderQuery(id));
  }

  async findAll() {
    return this.queryBus.execute(new FindManyOrdersQuery());
  }

  async updateOrder(id: string, dto: UpdateOrderDto) {
    return this.commandBus.execute(new UpdateOrderCommand(id, dto));
  }

  async deleteOrder(id: string) {
    return this.commandBus.execute(new DeleteOrderCommand(id));
  }
}
