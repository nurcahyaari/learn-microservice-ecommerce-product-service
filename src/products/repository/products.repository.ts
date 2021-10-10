import { EntityRepository, Repository } from 'typeorm';
import { Products } from '../entities/products.entitiy';

@EntityRepository(Products)
export class ProductsRepository extends Repository<Products> {}
