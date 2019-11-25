import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  IsNumber,
} from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  readonly orderNumber: string;

  @IsOptional()
  readonly goods: object;

  @IsString()
  @IsOptional()
  @IsIn(['in progress', 'cancelled', 'delivered'])
  readonly status: string;

  @IsNumber()
  @IsOptional()
  readonly quantity: number;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsString()
  @IsNotEmpty()
  readonly paymentMethod: string;
}
