import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { OrderRoot } from './orders.model';
import { OrderDocument } from './orders.schema';

@Injectable()
export class OrdersRepository {
  constructor(@InjectModel('Order') private readonly model: Model<OrderDocument>) {}

  async findAll() {
    const docs = await this.model.find().exec();
    const orderRoot = new OrderRoot(undefined);
    orderRoot.setData(docs);
    orderRoot.foundOrder();
    return orderRoot;
  }

  async findOne(id: Types.ObjectId) {
    const doc = await this.model.findById(id);
    const orderRoot = new OrderRoot(id.toHexString());
    if (doc === null) {
      throw new NotFoundException(`Order with id ${id} does not exists`);
    }
    orderRoot.setData(doc);
    orderRoot.foundOrder();
    return orderRoot;
  }

  async createOne(dto: CreateOrderDto) {
    const doc = await this.model.create(dto);
    const orderRoot = new OrderRoot(doc.id);
    orderRoot.setData(doc);
    return orderRoot;
  }

  async updateOne(id: string, dto: UpdateOrderDto) {
    const doc = await this.model.findByIdAndUpdate(new Types.ObjectId(id), { $set: dto }, { new: false }).exec();
    const orderRoot = new OrderRoot(id);
    if (doc === null) {
      throw new NotFoundException(`Order with id ${id} does not exists`);
    }
    orderRoot.setData(doc);
    return orderRoot;
  }

  async deleteOne(id: Types.ObjectId) {
    const doc = this.model.findByIdAndDelete(id).exec();
    const orderRoot = new OrderRoot(id.toHexString());

    if (doc === null) {
      throw new NotFoundException(`Order with id ${id} does not exists`);
    }

    orderRoot.setData(id.toHexString());
    return orderRoot;
  }
}
