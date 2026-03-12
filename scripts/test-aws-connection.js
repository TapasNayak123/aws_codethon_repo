/**
 * Test AWS DynamoDB connection
 */

const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

async function testConnection() {
  console.log('\n🔍 Testing AWS DynamoDB Connection...\n');
  console.log('Configuration:');
  console.log(`  Region: ${process.env.AWS_REGION}`);
  console.log(`  Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 10)}...`);
  console.log(`  Endpoint: ${process.env.DYNAMODB_ENDPOINT || 'AWS DynamoDB (default)'}\n`);

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    ...(process.env.DYNAMODB_ENDPOINT && {
      endpoint: process.env.DYNAMODB_ENDPOINT,
    }),
  });

  try {
    console.log('Attempting to list tables...');
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    
    console.log('\n✅ Connection successful!');
    console.log(`\nFound ${response.TableNames.length} table(s):`);
    response.TableNames.forEach((name) => {
      console.log(`  - ${name}`);
    });
    
    if (response.TableNames.length === 0) {
      console.log('\n💡 No tables found. Run "npm run create-tables" to create them.');
    }
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      console.error('\n🌐 Network Error:');
      console.error('  - Check your internet connection');
      console.error('  - Check if firewall is blocking AWS');
      console.error('  - Try disabling VPN if you have one');
    } else if (error.name === 'UnrecognizedClientException') {
      console.error('\n🔑 Invalid Credentials:');
      console.error('  - AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is wrong');
      console.error('  - Check your credentials in .env file');
    } else if (error.name === 'CredentialsProviderError') {
      console.error('\n🔑 Credentials Error:');
      console.error('  - Missing or invalid AWS credentials');
      console.error('  - Verify .env file has correct values');
    }
    
    process.exit(1);
  }
}

testConnection();
