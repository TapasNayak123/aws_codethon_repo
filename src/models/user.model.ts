import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDB } from '../config/database.config';
import { config } from '../config/env.config';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/user.types';

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
    email: userData.email.toLowerCase(),
    password: userData.password,
    favoriteProducts: [],
    createdAt: now,
    updatedAt: now,
  };

  const command = new PutCommand({
    TableName: config.dynamodb.usersTable,
    Item: user,
  });

  await dynamoDB.send(command);

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

  const result = await dynamoDB.send(command);

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

  const result = await dynamoDB.send(command);

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

  await dynamoDB.send(command);
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await findByEmail(email);
  return user !== null;
}


/**
 * Update user profile in DynamoDB
 */
export async function updateProfile(userId: string, updateData: UpdateUserDTO): Promise<void> {
  const now = new Date().toISOString();
  const updateExpressions: string[] = ['updatedAt = :updatedAt'];
  const expressionValues: Record<string, any> = { ':updatedAt': now };

  if (updateData.fullName !== undefined) {
    updateExpressions.push('fullName = :fullName');
    expressionValues[':fullName'] = updateData.fullName;
  }
  if (updateData.dateOfBirth !== undefined) {
    updateExpressions.push('dateOfBirth = :dateOfBirth');
    expressionValues[':dateOfBirth'] = updateData.dateOfBirth;
  }

  const command = new UpdateCommand({
    TableName: config.dynamodb.usersTable,
    Key: { userId },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeValues: expressionValues,
  });

  await dynamoDB.send(command);
}

/**
 * Add product to user's favorites
 */
export async function addFavoriteProduct(userId: string, productId: string): Promise<void> {
  const command = new UpdateCommand({
    TableName: config.dynamodb.usersTable,
    Key: { userId },
    UpdateExpression: 'ADD favoriteProducts :productId SET updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':productId': dynamoDB.createSet([productId]),
      ':updatedAt': new Date().toISOString(),
    },
  });

  await dynamoDB.send(command);
}

/**
 * Remove product from user's favorites
 */
export async function removeFavoriteProduct(userId: string, productId: string): Promise<void> {
  const command = new UpdateCommand({
    TableName: config.dynamodb.usersTable,
    Key: { userId },
    UpdateExpression: 'DELETE favoriteProducts :productId SET updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':productId': dynamoDB.createSet([productId]),
      ':updatedAt': new Date().toISOString(),
    },
  });

  await dynamoDB.send(command);
}

/**
 * Get user's favorite products
 */
export async function getFavoriteProducts(userId: string): Promise<string[]> {
  const user = await findById(userId);
  if (!user || !user.favoriteProducts) {
    return [];
  }
  return user.favoriteProducts;
}
