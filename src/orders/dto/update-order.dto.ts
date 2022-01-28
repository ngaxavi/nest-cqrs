import { IsNotEmpty, IsOptional, IsString, IsIn, IsNumber } from 'class-validator';
import { STATUS_TYPE } from '../orders.interface';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  readonly orderNumber?: string;

  @IsOptional()
  readonly goods?: any;

  @IsString()
  @IsOptional()
  @IsIn(STATUS_TYPE)
  readonly status?: string;

  @IsNumber()
  @IsOptional()
  readonly quantity?: number;

  @IsString()
  @IsNotEmpty()
  readonly address?: string;

  @IsString()
  @IsNotEmpty()
  readonly paymentMethod?: string;
}
