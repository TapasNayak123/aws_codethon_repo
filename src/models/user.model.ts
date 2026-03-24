import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDBClient } from '../config/database.config';
import { config } from '../config/env.config';
import { User, CreateUserDTO } from '../types/user.types';

const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

/**
 * Create a new user in DynamoDB
 */
export async function create(userData: CreateUserDTO & { password: string }): Promise<User> {
  const userId = uuidv4();
  const now = new Date().toISOString();

  const user: User = {
    userId,
    fullName: userData.fullName,
    dateOfBirth: userData.dateOfBirth,
    email: userData.email.toLowerCase(), // Store lowercase for consistency
    password: userData.password, // Already hashed by service
    createdAt: now,
    updatedAt: now,
  };

  const command = new PutCommand({
    TableName: config.dynamodb.usersTable,
    Item: user,
  });

  await docClient.send(command);

  return user;
}

/**
 * Find user by email using GSI
 */
export async function findByEmail(email: string): Promise<User | null> {
  const command = new QueryCommand({
    TableName: config.dynamodb.usersTable,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email.toLowerCase(),
    },
  });

  const result = await docClient.send(command);

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  return result.Items[0] as User;
}

/**
 * Find user by userId (primary key)
 */
export async function findById(userId: string): Promise<User | null> {
  const command = new GetCommand({
    TableName: config.dynamodb.usersTable,
    Key: {
      userId,
    },
  });

  const result = await docClient.send(command);

  if (!result.Item) {
    return null;
  }

  return result.Item as User;
}

/**
 * Update user password in DynamoDB
 */
export async function updatePassword(userId: string, hashedPassword: string): Promise<void> {
  const now = new Date().toISOString();

  const command = new UpdateCommand({
    TableName: config.dynamodb.usersTable,
    Key: {
      userId,
    },
    UpdateExpression: 'SET password = :password, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':password': hashedPassword,
      ':updatedAt': now,
    },
  });

  await docClient.send(command);
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await findByEmail(email);
  return user !== null;
}

/**
 * Rate a product
 */
export async function rateProduct(userId: string, productId: string, rating: number): Promise<void> {
  const command = new UpdateCommand({
    TableName: config.dynamodb.usersTable,
    Key: { userId },
    UpdateExpression: 'SET productRatings.#productId = :rating, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#productId': productId,
    },
    ExpressionAttributeValues: {
      ':rating': rating,
      ':updatedAt': new Date().toISOString(),
    },
  });

  await dynamoDB.send(command);
}

/**
 * Get user's product ratings
 */
export async function getUserRatings(userId: string): Promise<Record<string, number>> {
  const user = await findById(userId);
  if (!user || !user.productRatings) {
    return {};
  }
  return user.productRatings;
}
