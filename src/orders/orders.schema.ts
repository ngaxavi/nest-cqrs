import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { STATUS_TYPE } from './orders.interface';

@Schema({
  collation: {
    locale: 'en_US',
    strength: 1,
    caseLevel: true,
  },
  timestamps: true,
})
class Order {
  @Prop()
  orderNumber: string;

  @Prop(
    raw({
      _id: false,
    }),
  )
  goods: Record<string, any>;

  @Prop({ type: String, default: 'IN_PROGRESS', enum: STATUS_TYPE })
  status: string;

  @Prop()
  address: string;

  @Prop({ type: Number })
  quantity: number;

  @Prop()
  paymentMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
