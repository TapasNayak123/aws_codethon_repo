import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDBClient } from '../config/database.config';
import { config } from '../config/env.config';
import { Product, CreateProductDTO } from '../types/product.types';

const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

/**
 * Create a new product in DynamoDB
 */
export async function create(productData: CreateProductDTO): Promise<Product> {
  const productId = uuidv4();
  const now = new Date().toISOString();

  const product: Product = {
    productId,
    productName: productData.productName,
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

  await docClient.send(command);

  return product;
}

/**
 * Get all products from DynamoDB
 */
export async function findAll(): Promise<Product[]> {
  const command = new ScanCommand({
    TableName: config.dynamodb.productsTable,
  });

  const result = await docClient.send(command);

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

  const result = await docClient.send(command);

  if (!result.Item) {
    return null;
  }

  return result.Item as Product;
}
