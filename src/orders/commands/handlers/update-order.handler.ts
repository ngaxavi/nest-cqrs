import { Logger } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { yellowBright } from 'cli-color';
import { Types } from 'mongoose';
import { OrdersRepository } from 'src/orders/orders.repository';
import { UpdateOrderCommand } from '../impl/update-order.command';

@CommandHandler(UpdateOrderCommand)
export class UpdateOrderHandler implements ICommandHandler<UpdateOrderCommand> {
  constructor(
    private readonly orderRepository: OrdersRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: UpdateOrderCommand) {
    Logger.log(
      yellowBright('Async UpdateOrderHandler...', 'UpdateOrderCommand'),
    );

    const { id, orderDto } = command;
    const order = this.publisher.mergeObjectContext(
      await this.orderRepository.updateOne(new Types.ObjectId(id), orderDto),
    );
    order.updatedOrder();
    order.commit();
  }
}
