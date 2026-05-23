import { Controller, Post, Body, Get, Put, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { OrdersService } from './orders.service';
import { OrderDocument } from './orders.schema';

@Controller('orders')
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
  async findOrders() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOneOrder(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() orderDto: UpdateOrderDto) {
    return this.ordersService.updateOrder(id, orderDto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }
}
