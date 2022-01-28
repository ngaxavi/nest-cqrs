import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { yellowBright } from 'cli-color';
import { OrdersRepository } from 'src/orders/orders.repository';
import { FindManyOrdersQuery } from '../impl/find-many-orders.query';

@QueryHandler(FindManyOrdersQuery)
export class FindManyOrdersHandler implements IQueryHandler<FindManyOrdersQuery> {
  constructor(private readonly orderRepository: OrdersRepository) {}

  async execute(query: FindManyOrdersQuery) {
    Logger.log(yellowBright('Async FindManyOrdersHandler...', 'FindManyOrdersQuery'));

    Logger.log(JSON.stringify(query));
    return this.orderRepository.findAll();
  }
}
