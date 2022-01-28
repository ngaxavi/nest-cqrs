import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { yellowBright } from 'cli-color';
import { Types } from 'mongoose';
import { OrdersRepository } from 'src/orders/orders.repository';
import { FindSingleOrderQuery } from '../impl/find-single-order.query';

@QueryHandler(FindSingleOrderQuery)
export class FindSingleOrderHandler implements IQueryHandler<FindSingleOrderQuery> {
  constructor(private readonly orderRepository: OrdersRepository) {}

  async execute(query: FindSingleOrderQuery) {
    Logger.log(yellowBright('Async FindSingleOrderHandler...', 'FindSingleOrderQuery'));

    const { id } = query;
    return this.orderRepository.findOne(new Types.ObjectId(id));
  }
}
