import { CreateOrderHandler } from './create-order.handler';
import { UpdateOrderHandler } from './update-order.handler';
import { DeleteOrderHandler } from './delete-order.handler';

export const CommandHandlers = [CreateOrderHandler, UpdateOrderHandler, DeleteOrderHandler];
