import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDB } from '../config/database.config';
import { config } from '../config/env.config';
import { Product, CreateProductDTO, UpdateProductDTO } from '../types/product.types';

/**
 * Create a new product in DynamoDB
 */
export async function create(productData: CreateProductDTO): Promise<Product> {
  const productId = uuidv4();
  const now = new Date().toISOString();

  const product: Product = {
    productId,
    productName: productData.productName,
    category: productData.category,
    price: productData.price,
    availableQuantity: productData.availableQuantity,
    description: productData.description,
    imageUrl: productData.imageUrl,
    createdAt: now,
    updatedAt: now,
  };

  const command = new PutCommand({
    TableName: config.dynamodb.productsTable,
    Item: product,
  });

  await dynamoDB.send(command);

  return product;
}

/**
 * Get all products from DynamoDB
 */
export async function findAll(): Promise<Product[]> {
  const command = new ScanCommand({
    TableName: config.dynamodb.productsTable,
  });

  const result = await dynamoDB.send(command);

  if (!result.Items || result.Items.length === 0) {
    return [];
  }

  return result.Items as Product[];
}

/**
 * Find product by productId (primary key)
 */
export async function findById(productId: string): Promise<Product | null> {
  const command = new GetCommand({
    TableName: config.dynamodb.productsTable,
    Key: {
      productId,
    },
  });

  const result = await dynamoDB.send(command);

  if (!result.Item) {
    return null;
  }

  return result.Item as Product;
}


/**
 * Update a product in DynamoDB
 */
export async function update(productId: string, updateData: UpdateProductDTO): Promise<Product | null> {
  // Build dynamic update expression
  const updateExpressions: string[] = ['updatedAt = :updatedAt'];
  const expressionValues: Record<string, any> = {
    ':updatedAt': new Date().toISOString(),
  };
  const expressionNames: Record<string, string> = {};

  if (updateData.productName !== undefined) {
    updateExpressions.push('productName = :productName');
    expressionValues[':productName'] = updateData.productName;
  }
  if (updateData.category !== undefined) {
    updateExpressions.push('category = :category');
    expressionValues[':category'] = updateData.category;
  }
  if (updateData.price !== undefined) {
    updateExpressions.push('price = :price');
    expressionValues[':price'] = updateData.price;
  }
  if (updateData.availableQuantity !== undefined) {
    updateExpressions.push('availableQuantity = :availableQuantity');
    expressionValues[':availableQuantity'] = updateData.availableQuantity;
  }
  if (updateData.description !== undefined) {
    updateExpressions.push('#desc = :description');
    expressionValues[':description'] = updateData.description;
    expressionNames['#desc'] = 'description';
  }
  if (updateData.imageUrl !== undefined) {
    updateExpressions.push('imageUrl = :imageUrl');
    expressionValues[':imageUrl'] = updateData.imageUrl;
  }

  const command = new UpdateCommand({
    TableName: config.dynamodb.productsTable,
    Key: { productId },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeValues: expressionValues,
    ...(Object.keys(expressionNames).length > 0 && { ExpressionAttributeNames: expressionNames }),
    ReturnValues: 'ALL_NEW',
  });

  const result = await dynamoDB.send(command);
  return result.Attributes as Product || null;
}

/**
 * Delete a product from DynamoDB
 */
export async function remove(productId: string): Promise<Product | null> {
  const command = new DeleteCommand({
    TableName: config.dynamodb.productsTable,
    Key: { productId },
    ReturnValues: 'ALL_OLD',
  });

  const result = await dynamoDB.send(command);
  return result.Attributes as Product || null;
}
