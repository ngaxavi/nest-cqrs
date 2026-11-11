import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Types } from 'mongoose';
import { ApiKeyGuard } from '../core/security/api-key.guard';
import { ParseObjectIdPipe } from '../core/pipes/parse-object-id.pipe';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { OrdersService } from './orders.service';
import { OrderDocument } from './orders.schema';

@Controller('orders')
@UseGuards(ApiKeyGuard)
@UsePipes(new ValidationPipe())
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() orderDto: CreateOrderDto): Promise<OrderDocument> {
    if (!orderDto.orderNumber) {
      orderDto.orderNumber = randomUUID();
    }
    return this.ordersService.createOrder(orderDto);
  }

  @Get()
  async findOrders(@Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number) {
    return this.ordersService.findAll(Math.min(Math.max(limit, 1), 100));
  }

  @Get(':id')
  async findOneOrder(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.ordersService.findOne(id.toHexString());
  }

  @Put(':id')
  async updateOrder(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Body() orderDto: UpdateOrderDto) {
    return this.ordersService.updateOrder(id.toHexString(), orderDto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.ordersService.deleteOrder(id.toHexString());
  }
}
