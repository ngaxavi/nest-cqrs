import { ICommand } from '@nestjs/cqrs';

export class DeleteOrderCommand implements ICommand {
  constructor(public readonly id: string) {}
}
