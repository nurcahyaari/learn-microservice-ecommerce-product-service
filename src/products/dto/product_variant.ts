import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ProductVariantRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  variant_type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class ProductVariantPatchStock {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class ProductVariantParam {
  @ApiProperty()
  product_variant_id: number;
}

export class ProductVariantQueryStock {
  product_variant_id: number[];
  quantity: number[];
}
