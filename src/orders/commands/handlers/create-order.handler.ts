import { Logger } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { yellowBright } from 'cli-color';
import { OrdersRepository } from 'src/orders/orders.repository';
import { CreateOrderCommand } from '../impl/create-order.command';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly orderRepository: OrdersRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateOrderCommand) {
    Logger.log(yellowBright('Async CreateOrderHandler...', 'CreateOrderCommand'));

    const { orderDto } = command;
    const orderCreated = await this.orderRepository.createOne(orderDto);
    const order = this.publisher.mergeObjectContext(orderCreated);

    order.createdOrder();
    order.commit();
  }
}
