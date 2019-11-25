import { IEvent } from '@nestjs/cqrs';

export class OrderFoundEvent implements IEvent {
  constructor(public readonly id?: string) {}
}
