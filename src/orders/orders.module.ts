import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { EventStoreModule, EventStoreService } from 'src/core/event-store';
import { CommandHandlers } from './commands/handlers';
import { EventHandlers } from './events/handlers';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrderSchema } from './orders.schema';
import { OrdersService } from './orders.service';
import { QueryHandlers } from './queries/handlers';
import { OrderCreatedEvent } from './events/impl/order-created.event';
import { OrderUpdatedEvent } from './events/impl/order-updated.event';
import { OrderDeletedEvent } from './events/impl/order-deleted.event';
import { OrderFoundEvent } from './events/impl/order-found.event';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    EventStoreModule.forFeature(),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersRepository,
    OrdersService,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class OrdersModule implements OnModuleInit {
  public eventHandlers = {
    OrderCreatedEvent: (data: any) => new OrderCreatedEvent(data),
    OrderUpdatedEvent: (data: any) => new OrderUpdatedEvent(data),
    OrderDeletedEvent: (data: string) => new OrderDeletedEvent(data),
    OrderFoundEvent: (data?: string) => new OrderFoundEvent(data),
  };

  constructor(
    private readonly eventStore: EventStoreService,
    private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    this.eventStore.setEventHandlers(this.eventHandlers);
    this.eventStore.bridgeEventsTo(this.eventBus.subject$);
    this.eventBus.publisher = this.eventStore;
  }
}
