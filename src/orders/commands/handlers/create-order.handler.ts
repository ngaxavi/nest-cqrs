import { Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  EventPublisher,
  ICommandHandler,
} from '@nestjs/cqrs';
import { yellowBright } from 'cli-color';
import { OrdersRepository } from 'src/orders/orders.repository';
import { CreateOrderCommand } from '../impl/create-order.command';
import { OrderRoot } from '../../orders.model';
import { OrderCreatedEvent } from '../../events/impl/order-created.event';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly orderRepository: OrdersRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreateOrderCommand) {
    Logger.log(
      yellowBright('Async CreateOrderHandler...', 'CreateOrderCommand'),
    );

    const { orderDto } = command;
    const orderCreated = await this.orderRepository.createOne(orderDto);
    const order = this.publisher.mergeObjectContext(orderCreated);

    order.createdOrder();
    order.commit();
  }
}
