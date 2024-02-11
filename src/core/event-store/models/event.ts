import { IEvent } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';

const clone = (objEvent: Event) => Object.assign(Object.create(Object.getPrototypeOf(objEvent)), objEvent);

export interface Metadata {
  _stream?: string;
  _aggregate_id: string;
  _aggregate_version: number;
  _aggregate_encrypted: boolean;
  _encrypted_payload?: string | undefined;
  _ocurred_on: number;
}

export class Event<P = unknown> implements IEvent {
  public readonly eventId: string;
  public readonly eventType: string;

  private readonly _payload: P;
  private readonly _metadata: Metadata;

  constructor(aggregateId: string, payload?: P) {
    this.eventId = uuid();
    this._payload = { ...payload };
    this.eventType = Object.getPrototypeOf(this).constructor.name;
    this._metadata = {
      _aggregate_id: aggregateId,
      _aggregate_version: -2,
      _aggregate_encrypted: false,
      _ocurred_on: new Date().getTime(),
    };
  }

  get payload(): Readonly<P> {
    return this._payload;
  }

  get metadata(): Readonly<Metadata> {
    return this._metadata;
  }

  get stream(): string {
    return this._metadata._stream;
  }

  get aggregateId(): string {
    return this._metadata._aggregate_id;
  }

  get aggregateEncrypted(): boolean {
    return this._metadata._aggregate_encrypted;
  }

  get version(): number {
    return this._metadata._aggregate_version;
  }

  get ocurredOn(): number {
    return this._metadata._ocurred_on;
  }

  get encryptedPayload(): string | undefined {
    return this._metadata._encrypted_payload;
  }

  withEncryptedAggregate(): Event {
    const event = clone(this);
    event._metadata = {
      ...this._metadata,
      _aggregate_encrypted: true,
    };

    return event;
  }

  withEncryptedPayload(cryptedPayload: string): Event {
    const event = clone(this);

    return event.withPayload({} as P).withMetadata({
      ...this._metadata,
      _encrypted_payload: cryptedPayload,
    });
  }

  withMetadata(metadata: Metadata): Event<P> {
    const event = clone(this);
    event._metadata = {
      ...metadata,
    };

    return event;
  }

  withPayload(payload: P): Event {
    const event = clone(this);
    event._payload = {
      ...payload,
    };

    return event;
  }

  withStream(stream: string): Event<P> {
    const event = clone(this);
    event._metadata = {
      ...this._metadata,
      _stream: stream,
    };

    return event;
  }

  withVersion(version: number): Event<P> {
    const event = clone(this);
    event._metadata = {
      ...this._metadata,
      _aggregate_version: version,
    };

    return event;
  }
}
