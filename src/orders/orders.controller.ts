import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { Order } from './orders.interface';
import { OrdersService } from './orders.service';
import { v4 as uuid } from 'uuid';

@Controller('orders')
@UsePipes(new ValidationPipe())
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() orderDto: CreateOrderDto): Promise<Order> {
    if (!orderDto.orderNumber) {
      orderDto.orderNumber = uuid();
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
