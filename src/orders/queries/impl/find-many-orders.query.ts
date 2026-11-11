import { IQuery } from '@nestjs/cqrs';

export class FindManyOrdersQuery implements IQuery {
  constructor(public readonly limit: number) {}
}
