import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from './env.config';

// Create DynamoDB client
// If explicit credentials are provided (local dev), use them.
// Otherwise, let the SDK use the default credential chain (ECS task role, etc.)
const clientConfig: ConstructorParameters<typeof DynamoDBClient>[0] = {
  region: config.aws.region,
  ...(config.aws.dynamodbEndpoint && {
    endpoint: config.aws.dynamodbEndpoint,
  }),
};

if (config.aws.accessKeyId && config.aws.secretAccessKey) {
  clientConfig.credentials = {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  };
}

const dynamoDBClient = new DynamoDBClient(clientConfig);

// Export the base client
export { dynamoDBClient };

// Create DynamoDB Document client for easier operations
export const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});
