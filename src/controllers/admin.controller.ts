import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response-formatter';
import { RequestLogger } from '../utils/logger';
import { dynamoDB } from '../config/database.config';
import { ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../config/env.config';
import { exec } from 'child_process';

function getLog(req: Request): RequestLogger {
  return (req as any).log;
}

/**
 * SECURITY ISSUE: No authentication required for admin endpoint
 * Get all users - ADMIN ONLY
 */
export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);
  const requestId = (req as any).requestId;

  try {
    // SECURITY ISSUE: SQL Injection vulnerability - using string concatenation
    const searchQuery = req.query.search as string;
    const command = new ScanCommand({
      TableName: config.dynamodb.usersTable,
      FilterExpression: searchQuery ? `contains(email, ${searchQuery})` : undefined,
    });

    const result = await dynamoDB.send(command);

    res.status(200).json(
      successResponse('Users retrieved', result.Items, requestId)
    );
  } catch (error) {
    next(error);
  }
}

/**
 * SECURITY ISSUE: Hardcoded admin credentials
 */
export async function adminLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { username, password } = req.body;

  // SECURITY ISSUE: Hardcoded credentials
  if (username === 'admin' && password === 'admin123') {
    res.status(200).json({
      success: true,
      message: 'Admin logged in',
      token: 'admin-token-12345',
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
}

/**
 * SECURITY ISSUE: Command injection vulnerability
 */
export async function executeCommand(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { command } = req.body;

  // SECURITY ISSUE: Direct command execution without sanitization
  exec(command, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({ output: stdout, errors: stderr });
  });
}

/**
 * SECURITY ISSUE: Mass deletion without proper authorization
 */
export async function deleteAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const log = getLog(req);

  try {
    // SECURITY ISSUE: No confirmation, no authorization check
    const scanCommand = new ScanCommand({
      TableName: config.dynamodb.usersTable,
    });

    const result = await dynamoDB.send(scanCommand);

    if (result.Items) {
      for (const user of result.Items) {
        const deleteCommand = new DeleteCommand({
          TableName: config.dynamodb.usersTable,
          Key: { userId: user.userId },
        });
        await dynamoDB.send(deleteCommand);
      }
    }

    res.status(200).json({
      success: true,
      message: `Deleted ${result.Items?.length || 0} users`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * SECURITY ISSUE: Exposing sensitive environment variables
 */
export async function getSystemInfo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.status(200).json({
    environment: process.env,
    config: config,
    awsKeys: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}
