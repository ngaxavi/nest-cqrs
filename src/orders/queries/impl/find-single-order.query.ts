import { IQuery } from '@nestjs/cqrs';

export class FindSingleOrderQuery implements IQuery {
  constructor(public readonly id: string) {}
}
