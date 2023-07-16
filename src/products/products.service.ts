import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async insertProduct(
    title: string,
    description: string,
    price: number,
  ): Promise<string> {
    const newProduct = new this.productModel({
      title,
      description,
      price,
    });

    const result = await newProduct.save();

    return result.id as string;
  }

  async getProducts() {
    const products = await this.productModel.find().exec();

    return products.map((prod) => ({
      id: prod.id,
      title: prod.title,
      description: prod.description,
      price: prod.price,
    })) as Product[];
  }

  async getSignleProduct(id: string) {
    const product = await this.findProduct(id);
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    };
  }

  async updateProduct(
    productId: string,
    title: string,
    description: string,
    price: number,
  ) {
    const updateProduct = await this.findProduct(productId);

    if (title) {
      updateProduct.title = title;
    }
    if (description) {
      updateProduct.description = description;
    }
    if (price) {
      updateProduct.price = price;
    }

    updateProduct.save();
  }

  async deleteProduct(prodId: string) {
    const result = await this.productModel.deleteOne({ _id: prodId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Could not find product.');
    }
  }

  private async findProduct(id: string): Promise<Product> {
    let product;

    try {
      product = await this.productModel.findById(id).exec();
    } catch (error) {
      throw new NotFoundException('Could not find product.');
    }

    if (!product) {
      throw new NotFoundException('Could not find product.');
    }

    return product;
  }
}
