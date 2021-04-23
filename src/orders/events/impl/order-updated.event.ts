import { IEvent } from '@nestjs/cqrs';

export class OrderUpdatedEvent implements IEvent {
  constructor(public readonly orderDto: any) {}
}
