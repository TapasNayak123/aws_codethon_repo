/**
 * Add email-index to prod-Users table
 */

const { DynamoDBClient, UpdateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

async function addEmailIndex() {
  const tableName = 'prod-Users';
  
  try {
    console.log(`Checking table: ${tableName}...`);
    
    // Check if index already exists
    const describeCommand = new DescribeTableCommand({ TableName: tableName });
    const tableInfo = await client.send(describeCommand);
    
    const hasEmailIndex = tableInfo.Table.GlobalSecondaryIndexes?.some(
      index => index.IndexName === 'email-index'
    );
    
    if (hasEmailIndex) {
      console.log('✅ email-index already exists!');
      return;
    }
    
    console.log('Adding email-index to table...');
    
    const updateCommand = new UpdateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'email-index',
            KeySchema: [
              { AttributeName: 'email', KeyType: 'HASH' }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
            }
          }
        }
      ]
    });
    
    await client.send(updateCommand);
    console.log('✅ email-index created successfully!');
    console.log('⏳ Index is being created... This may take a few minutes.');
    console.log('   You can check status with: aws dynamodb describe-table --table-name prod-Users --region us-east-1');
    
  } catch (error) {
    console.error('❌ Error adding email-index:', error.message);
    process.exit(1);
  }
}

addEmailIndex();
