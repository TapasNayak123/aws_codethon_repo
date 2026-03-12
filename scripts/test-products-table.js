/**
 * Test script to verify Products table exists and can be queried
 */

import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

async function testProductsTable() {
  const tableName = process.env.DYNAMODB_PRODUCTS_TABLE || 'dev-Products';

  console.log('\n🔍 Testing Products Table...');
  console.log('Table Name:', tableName);
  console.log('Region:', process.env.AWS_REGION);

  try {
    // 1. Check if table exists
    console.log('\n1️⃣ Checking if table exists...');
    const describeCommand = new DescribeTableCommand({
      TableName: tableName,
    });
    const tableInfo = await client.send(describeCommand);
    console.log('✅ Table exists!');
    console.log('   Status:', tableInfo.Table.TableStatus);
    console.log('   Item Count:', tableInfo.Table.ItemCount);
    console.log('   Key Schema:', JSON.stringify(tableInfo.Table.KeySchema, null, 2));

    // 2. Try to scan the table
    console.log('\n2️⃣ Scanning table for products...');
    const scanCommand = new ScanCommand({
      TableName: tableName,
    });
    const result = await docClient.send(scanCommand);
    console.log('✅ Scan successful!');
    console.log('   Products found:', result.Items?.length || 0);

    if (result.Items && result.Items.length > 0) {
      console.log('\n📦 Products in table:');
      result.Items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.productName} - $${item.price}`);
      });
    } else {
      console.log('   ℹ️  No products in table yet');
    }

    console.log('\n✅ All tests passed! Products table is working correctly.\n');
  } catch (error) {
    console.error('\n❌ Error testing Products table:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.name);
    
    if (error.name === 'ResourceNotFoundException') {
      console.error('\n💡 Solution: Run the table creation script:');
      console.error('   npm run create-tables\n');
    } else if (error.name === 'UnrecognizedClientException') {
      console.error('\n💡 Solution: Check your AWS credentials in .env file\n');
    } else {
      console.error('\n   Full error:', error);
    }
    process.exit(1);
  }
}

testProductsTable();
