import { AggregateRoot } from '@nestjs/cqrs';
import { OrderCreatedEvent } from './events/impl/order-created.event';
import { OrderUpdatedEvent } from './events/impl/order-updated.event';
import { OrderDeletedEvent } from './events/impl/order-deleted.event';
import { OrderFoundEvent } from './events/impl/order-found.event';

export class OrderRoot extends AggregateRoot {
  data: any;

  constructor(private readonly id: string | undefined) {
    super();
  }

  setData(data: any) {
    this.data = data;
  }

  createdOrder() {
    this.apply(new OrderCreatedEvent(this.data));
  }

  updatedOrder() {
    this.apply(new OrderUpdatedEvent(this.data));
  }

  deletedOrder() {
    this.apply(new OrderDeletedEvent(this.data));
  }

  foundOrder() {
    this.apply(new OrderFoundEvent(this.data));
  }
}
