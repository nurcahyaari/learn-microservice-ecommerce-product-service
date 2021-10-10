import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Products } from './products.entitiy';

@Entity({ name: 'product_variants' })
export class ProductVariants {
  @PrimaryGeneratedColumn({ name: 'product_variant_id' })
  product_variant_id: number;

  @Column({ name: 'variant_type' })
  variant_type: string;

  @Column({ name: 'quantity' })
  quantity: number;

  @Column({ name: 'price' })
  price: number;

  @ManyToOne((type) => Products, (product) => product.product_id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Products;
}
