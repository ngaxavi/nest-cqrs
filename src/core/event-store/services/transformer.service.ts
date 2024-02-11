import { ResolvedEvent } from '@eventstore/db-client';
import { Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';

import { TransformerNotFoundError } from '../errors';
import { Transformer, TransformerRepo } from '../event-store.interface';

export const EVENT_STORE_TRANSFORMERS_TOKEN = 'EVENT_STORE_TRANSFORMERS_TOKEN';

@Injectable()
export class TransformerService {
  private readonly repo: TransformerRepo;

  constructor(private readonly modules: ModulesContainer) {
    const transformers = [...this.modules.values()]
      .flatMap((module) => [...module.providers.values()])
      .filter(({ name }) => name === EVENT_STORE_TRANSFORMERS_TOKEN)
      .flatMap(({ instance }) => Object.entries(instance as TransformerRepo));

    this.repo = Object.fromEntries(transformers);
  }

  public getTransformerToEvent(resolvedEvent: ResolvedEvent): Transformer | null {
    const type = resolvedEvent.event.type;

    const transformer = this.repo[type];
    if (!transformer) {
      throw TransformerNotFoundError.withType(type);
    }

    return transformer;
  }
}
