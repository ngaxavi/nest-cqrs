import { Logger } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { yellowBright } from 'cli-color';
import { Types } from 'mongoose';
import { OrdersRepository } from 'src/orders/orders.repository';
import { DeleteOrderCommand } from '../impl/delete-order.command';

@CommandHandler(DeleteOrderCommand)
export class DeleteOrderHandler implements ICommandHandler<DeleteOrderCommand> {
  constructor(
    private readonly orderRepository: OrdersRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: DeleteOrderCommand) {
    Logger.log(yellowBright('Async DeleteOrderHandler...', 'DeleteOrderCommand'));

    const { id } = command;
    const order = this.publisher.mergeObjectContext(await this.orderRepository.deleteOne(new Types.ObjectId(id)));
    order.deletedOrder();
    order.commit();
  }
}
