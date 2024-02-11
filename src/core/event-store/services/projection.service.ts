import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IEventHandler } from '@nestjs/cqrs';
import { EVENTS_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';

@Injectable()
export class ProjectionService {
  constructor(
    private readonly explorer: ExplorerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  public eventHandlers(): Record<string, IEventHandler[]> {
    return this.explorer.explore().events.reduce((prev, handler) => {
      const instance = this.moduleRef.get(handler, { strict: false });

      if (!instance) {
        return prev;
      }

      const eventsNames = Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);

      eventsNames.map((event) => {
        const key = event.name;

        prev[key] = prev[key] ? [...prev[key], instance] : [instance];
      });

      return prev;
    }, {});
  }
}
