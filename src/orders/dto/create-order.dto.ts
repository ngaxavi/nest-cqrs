import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  IsNumber,
} from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  orderNumber: string;

  @IsNotEmpty()
  readonly goods: object;

  @IsString()
  @IsOptional()
  @IsIn(['in progress', 'cancelled', 'delivered'])
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
