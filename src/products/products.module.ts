import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemUserAuthMiddleware } from 'src/external/auth/system-user-auth.middleware';
import { UserAuthMiddleware } from 'src/external/auth/user-auth.middleware';
import { ProductsController } from './handlers/http/products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './repository/products.repository';
import { ProductVariantsRepository } from './repository/product_variants.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductsRepository, ProductVariantsRepository]),
    CacheModule.register(),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SystemUserAuthMiddleware)
      .exclude(
        {
          path: '/v1/products',
          method: RequestMethod.GET,
        },
        {
          path: '/v1/products/:product_id',
          method: RequestMethod.GET,
        },
        {
          path: '/v1/products/product_variant/:product_variant_id',
          method: RequestMethod.GET,
        },
        {
          path: '/v1/products/product_variant/patch-stock/transaction-start/:product_variant_id',
          method: RequestMethod.PATCH,
        },
        {
          path: '/v1/products/product_variant/patch-stock/transaction/commit',
          method: RequestMethod.GET,
        },
        {
          path: '/v1/products/product_variant/patch-stock/transaction/rollback',
          method: RequestMethod.GET,
        },
      )
      .forRoutes(ProductsController);

    consumer
      .apply(UserAuthMiddleware)
      .exclude(
        {
          path: '/v1/products/product_variant/admin/stock/:product_variant_id',
          method: RequestMethod.PATCH,
        },
        {
          path: '/v1/products/product_variant/:product_variant_id',
          method: RequestMethod.DELETE,
        },
        {
          path: '/v1/products/product_variant/:product_variant_id',
          method: RequestMethod.GET,
        },
        {
          path: '/v1/products/:product_id',
          method: RequestMethod.DELETE,
        },
        {
          path: '/v1/products/product_variant',
          method: RequestMethod.POST,
        },
        {
          path: '/v1/products',
          method: RequestMethod.POST,
        },
        {
          path: '/v1/products/:product_id',
          method: RequestMethod.GET,
        },
        {
          path: '/v1/products',
          method: RequestMethod.GET,
        },
      )
      .forRoutes(ProductsController);
  }
}
