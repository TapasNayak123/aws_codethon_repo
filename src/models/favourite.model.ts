import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDBClient } from '../config/database.config';
import { config } from '../config/env.config';
import { Favourite } from '../types/favourite.types';

const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

/**
 * Add a product to user's favourites
 */
export async function create(userId: string, productId: string): Promise<Favourite> {
  const favouriteId = uuidv4();
  const now = new Date().toISOString();

  const favourite: Favourite = {
    favouriteId,
    userId,
    productId,
    createdAt: now,
  };

  const command = new PutCommand({
    TableName: config.dynamodb.favouritesTable,
    Item: favourite,
  });

  await docClient.send(command);
  return favourite;
}

/**
 * Find all favourites for a user
 */
export async function findByUserId(userId: string): Promise<Favourite[]> {
  const command = new QueryCommand({
    TableName: config.dynamodb.favouritesTable,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  });

  const result = await docClient.send(command);
  return (result.Items || []) as Favourite[];
}

/**
 * Check if a product is already in user's favourites
 */
export async function exists(userId: string, productId: string): Promise<boolean> {
  const command = new QueryCommand({
    TableName: config.dynamodb.favouritesTable,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    FilterExpression: 'productId = :productId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':productId': productId,
    },
  });

  const result = await docClient.send(command);
  return (result.Items && result.Items.length > 0) || false;
}

/**
 * Remove a favourite by favouriteId
 */
export async function remove(favouriteId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: config.dynamodb.favouritesTable,
    Key: { favouriteId },
  });

  await docClient.send(command);
}
