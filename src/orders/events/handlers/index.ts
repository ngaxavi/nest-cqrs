import { OrderCreatedHandler } from './order-created.handler';
import { OrderUpdatedHandler } from './order-updated.handler';
import { OrderDeletedHandler } from './order-deleted.handler';
import { OrderFoundHandler } from './order-found.handler';

export const EventHandlers = [
  OrderCreatedHandler,
  OrderUpdatedHandler,
  OrderDeletedHandler,
  OrderFoundHandler,
];
