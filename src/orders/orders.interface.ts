import { Document } from 'mongoose';

export const STATUS_TYPE = ['IN_PROGRESS', 'CANCELLED', 'DELIVERED'];

export interface Order extends Document {
  readonly orderNumber: string;
  readonly goods: any;
  readonly status: string;
  readonly address: string;
  readonly quantity: number;
  readonly paymentMethod: string;
}
