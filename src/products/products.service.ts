import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { DeleteResult, MoreThan } from 'typeorm';
import { ProductRequest } from './dto/product';
import {
  ProductVariantQueryStock,
  ProductVariantRequest,
} from './dto/product_variant';
import { Products } from './entities/products.entitiy';
import { ProductVariants } from './entities/product_variants.entity';
import { ProductsRepository } from './repository/products.repository';
import { ProductVariantsRepository } from './repository/product_variants.repository';

export interface ProductServiceInterface {
  GetProductList(): Promise<Products[]>;
  GetProductById(productId: number): Promise<Products>;
  SaveProduct(productDto: ProductRequest): Promise<Products>;
  SaveProductVariant(
    productVariantDto: ProductVariantRequest,
  ): Promise<Products>;
  DeleteProduct(productId: number): Promise<DeleteResult>;
  DeleteProductVariant(productVariantId: number): Promise<DeleteResult>;
}

@Injectable()
export class ProductsService implements ProductServiceInterface {
  constructor(
    @InjectRepository(ProductsRepository)
    private readonly productsRepository: ProductsRepository,
    @InjectRepository(ProductVariantsRepository)
    private readonly productVariantsRepository: ProductVariantsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async GetProductList(): Promise<Products[]> {
    const products = await this.productsRepository.find({
      relations: ['product_variants'],
    });
    return products;
  }

  GetProductById(productId: number): Promise<Products> {
    return this.productsRepository.findOne({
      where: {
        product_id: productId,
      },
      relations: ['product_variants'],
    });
  }

  GetProductVariantByVariantId(variantId: number): Promise<ProductVariants> {
    return this.productVariantsRepository.findOne({
      where: {
        product_variant_id: variantId,
      },
    });
  }

  SaveProduct(productDto: ProductRequest): Promise<Products> {
    const productNew = new Products();
    productNew.name = productDto.name;
    productNew.description = productDto.description;
    return this.productsRepository.save(productNew);
  }

  async SaveProductVariant(
    productVariantDto: ProductVariantRequest,
  ): Promise<Products> {
    const product = await this.productsRepository.findOne(
      productVariantDto.product_id,
    );
    const productVariantNew = new ProductVariants();
    productVariantNew.variant_type = productVariantDto.variant_type;
    productVariantNew.price = productVariantDto.price;
    productVariantNew.quantity = productVariantDto.quantity;
    productVariantNew.product = product;
    await this.productVariantsRepository.save(productVariantNew);

    return await this.productsRepository.findOne({
      where: {
        product_id: productVariantDto.product_id,
      },
      relations: ['product_variants'],
    });
  }

  DeleteProduct(productId: number): Promise<DeleteResult> {
    return this.productsRepository.delete(productId);
  }

  DeleteProductVariant(productVariantId: number): Promise<DeleteResult> {
    return this.productVariantsRepository.delete(productVariantId);
  }

  async PatchProductVariantAdminStock(
    productVariantId: number,
    quantity: number,
  ): Promise<ProductVariants> {
    const variant = await this.productVariantsRepository.findOne(
      productVariantId,
    );

    variant.quantity = quantity;

    await this.productVariantsRepository.save(variant);

    return variant;
  }

  async StartPatchProductVariantUserStock(
    userId: string,
    productVariantId: number,
    quantity: number,
  ): Promise<ProductVariants> {
    try {
      const variant = await this.productVariantsRepository.findOne(
        productVariantId,
        {
          where: {
            quantity: MoreThan(0),
          },
        },
      );
      if (!variant) {
        throw new Error('variant is not found or empty');
      }
      const productVariantQuantityById = await this.cacheManager.get(
        `${productVariantId}-quantity`,
      );

      if (productVariantQuantityById) {
        if (productVariantQuantityById <= 0) {
          throw new Error('variant is empty');
        }
      }

      await this.cacheManager.set(
        `${userId}-order-product`,
        JSON.stringify(variant),
      );
      variant.quantity -= quantity;
      await this.productVariantsRepository.save(variant);
      await this.cacheManager.set(
        `${productVariantId}-quantity`,
        variant.quantity,
      );

      return variant;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async CommitPatchProductVariantUserStock(userId: string): Promise<boolean> {
    try {
      await this.cacheManager.del(`${userId}-order-product`);
      return true;
    } catch (e) {
      return e;
    }
  }

  async RollbackPatchProductVariantUserStock(userId: string): Promise<boolean> {
    try {
      const productVariantUserOrderCache: string = await this.cacheManager.get(
        `${userId}-order-product`,
      );

      const productVariant: ProductVariants = JSON.parse(
        productVariantUserOrderCache,
      );
      await this.productVariantsRepository.save(productVariant);

      const productVariantQuantityById: number = await this.cacheManager.get(
        `${productVariant.product_variant_id}-quantity`,
      );
      await this.cacheManager.set(
        `${productVariant.product_variant_id}-quantity`,
        productVariantQuantityById + productVariant.quantity,
      );
      await this.cacheManager.del(`${userId}-order-product`);
      return true;
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
