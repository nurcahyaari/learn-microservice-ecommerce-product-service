import { EntityRepository, Repository } from 'typeorm';
import { ProductVariants } from '../entities/product_variants.entity';

@EntityRepository(ProductVariants)
export class ProductVariantsRepository extends Repository<ProductVariants> {}
