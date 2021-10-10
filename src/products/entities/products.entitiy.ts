import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductVariants } from './product_variants.entity';

@Entity({ name: 'products' })
export class Products {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  product_id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description' })
  description: string;

  @OneToMany(
    (type) => ProductVariants,
    (productVariants) => productVariants.product,
  )
  product_variants: ProductVariants[];
}
