import { IsNotEmpty, IsOptional, IsString, IsIn, IsNumber } from 'class-validator';
import { STATUS_TYPE } from '../orders.interface';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  orderNumber: string;

  @IsNotEmpty()
  readonly goods: any;

  @IsString()
  @IsOptional()
  @IsIn(STATUS_TYPE)
  readonly status: string;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsNumber()
  @IsNotEmpty()
  readonly quantity: number;

  @IsString()
  @IsNotEmpty()
  readonly paymentMethod: string;
}
