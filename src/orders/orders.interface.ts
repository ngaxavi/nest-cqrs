import { Document } from 'mongoose';

export interface Order extends Document {
  readonly orderNumber: string;
  readonly goods: object;
  readonly status: string;
  readonly address: string;
  readonly quantity: number;
  readonly paymentMethod: string;
}
