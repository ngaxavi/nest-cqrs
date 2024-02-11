import { Injectable, Logger } from '@nestjs/common';
import { JSONType, ResolvedEvent } from '@eventstore/db-client';
import { Metadata } from './models';
import { TransformerService } from './services';

@Injectable()
export class EventStoreMapper {
  private readonly logger = new Logger(EventStoreMapper.name);

  constructor(private readonly transformerService: TransformerService) {}

  public async resolvedEventToDomainEvent(resolvedEvent: ResolvedEvent): Promise<Event> | null {
    if (resolvedEvent.event === undefined || resolvedEvent.event.type.startsWith('$')) {
      return null;
    }

    try {
      const metadata = resolvedEvent.event.metadata as Metadata;
      const payload = await this.extractPayload(resolvedEvent);
      const transformer = this.transformerService.getTransformerToEvent(resolvedEvent);

      const event = transformer?.(new Event(metadata._aggregate_id, payload)).withMetadata(metadata);

      return event;
    } catch (error) {
      if (error instanceof KeyNotFoundError) {
        this.logger.error(`Error during decrypting ${resolvedEvent.event.type}: ${error.message}`);

        return null;
      }

      throw error;
    }
  }

  private async extractPayload(resolvedEvent: ResolvedEvent): Promise<JSONType | Uint8Array> {
    const metadata = resolvedEvent.event.metadata as Metadata;
    return metadata._encrypted_payload
      ? await this.keyService.decryptPayload(metadata._aggregate_id, metadata._encrypted_payload)
      : resolvedEvent.event.data;
  }
}
