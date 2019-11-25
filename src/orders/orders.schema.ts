import { Schema } from 'mongoose';

export const OrderSchema = new Schema(
  {
    orderNumber: String,
    goods: { type: Schema.Types.Mixed },
    status: {
      type: String,
      default: 'in progress',
      enum: ['in progress', 'cancelled', 'delivered'],
    },
    address: String,
    quanity: Number,
    paymentMethid: String,
  },
  { timestamps: true },
);
