import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtToken } from 'src/external/auth/token.dto';
import { ProductParam, ProductRequest } from 'src/products/dto/product';
import {
  ProductVariantParam,
  ProductVariantPatchStock,
  ProductVariantRequest,
} from 'src/products/dto/product_variant';
import { ProductsService } from 'src/products/products.service';

@Controller('/v1/products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get('/')
  GetProducts() {
    return this.productService.GetProductList();
  }

  @Get('/:product_id')
  GetProductById(@Param() param: ProductParam) {
    return this.productService.GetProductById(param.product_id);
  }

  @ApiBearerAuth('token')
  @Post('/')
  SaveProduct(@Body() body: ProductRequest) {
    return this.productService.SaveProduct(body);
  }

  @ApiBearerAuth('token')
  @Post('/product_variant')
  SaveProductVariant(@Body() body: ProductVariantRequest) {
    return this.productService.SaveProductVariant(body);
  }

  @Get('/product_variant/:product_variant_id')
  GetProductVariantByVariantId(@Param() param: ProductVariantParam) {
    return this.productService.GetProductVariantByVariantId(
      param.product_variant_id,
    );
  }

  @ApiBearerAuth('token')
  @Delete('/:product_id')
  DeleteProduct(@Param() param: ProductParam) {
    return this.productService.DeleteProduct(param.product_id);
  }

  @ApiBearerAuth('token')
  @Delete('/product_variant/:product_variant_id')
  DeleteProductVariant(@Param() param: ProductVariantParam) {
    return this.productService.DeleteProductVariant(param.product_variant_id);
  }

  @ApiBearerAuth('token')
  @Patch('/product_variant/admin/stock/:product_variant_id')
  PatchProductVariantAdminStock(
    @Param() param: ProductVariantParam,
    @Body() body: ProductVariantPatchStock,
  ) {
    return this.productService.PatchProductVariantAdminStock(
      param.product_variant_id,
      body.quantity,
    );
  }

  @ApiBearerAuth('token')
  @Patch('/product_variant/patch-stock/transaction-start/:product_variant_id')
  StartPatchProductVariantUserStock(
    @Param() param: ProductVariantParam,
    @Body() body: ProductVariantPatchStock,
    @Request() req,
  ) {
    const user = req.headers.user;
    return this.productService.StartPatchProductVariantUserStock(
      user.user_id,
      param.product_variant_id,
      body.quantity,
    );
  }

  @ApiBearerAuth('token')
  @Get('/product_variant/patch-stock/transaction/commit')
  CommitPatchProductVariantUserStock(@Request() req) {
    const user = req.headers.user;
    return this.productService.CommitPatchProductVariantUserStock(user.user_id);
  }

  @ApiBearerAuth('token')
  @Get('/product_variant/patch-stock/transaction/rollback')
  RollbackPatchProductVariantUserStock(@Request() req) {
    try {
      console.log('rollback');
      const user = req.headers.user;
      return this.productService.RollbackPatchProductVariantUserStock(
        user.user_id,
      );
    } catch (e) {
      console.log('rollback - failed');
      console.log(e);
      return e;
    }
  }
}
