/**
 * Seed sample fruits data into DynamoDB Products table
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

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

const docClient = DynamoDBDocumentClient.from(client);

const sampleFruits = [
  {
    productName: 'Mango',
    price: 3.99,
    availableQuantity: 50,
    description: 'Sweet and juicy Alphonso mangoes, perfect for summer. Rich in vitamins A and C.',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400',
  },
  {
    productName: 'Orange',
    price: 2.49,
    availableQuantity: 100,
    description: 'Fresh Valencia oranges, bursting with citrus flavor. Great source of vitamin C.',
    imageUrl: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400',
  },
  {
    productName: 'Pineapple',
    price: 4.99,
    availableQuantity: 30,
    description: 'Tropical golden pineapples, sweet and tangy. Perfect for smoothies and desserts.',
    imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400',
  },
  {
    productName: 'Apple',
    price: 1.99,
    availableQuantity: 150,
    description: 'Crisp Red Delicious apples, perfect for snacking. A classic favorite for all ages.',
    imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
  },
  {
    productName: 'Banana',
    price: 1.49,
    availableQuantity: 200,
    description: 'Fresh Cavendish bananas, naturally sweet and creamy. Great energy booster.',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
  },
];

async function seedFruits() {
  console.log('\n🌱 Seeding sample fruits data...\n');

  try {
    for (const fruit of sampleFruits) {
      const product = {
        productId: uuidv4(),
        ...fruit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const command = new PutCommand({
        TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
        Item: product,
      });

      await docClient.send(command);
      console.log(`✅ Added: ${fruit.productName} ($${fruit.price})`);
    }

    console.log('\n✅ Successfully seeded all fruits!');
    console.log(`\nTotal products added: ${sampleFruits.length}`);
  } catch (error) {
    console.error('\n❌ Error seeding fruits:', error.message);
    process.exit(1);
  }
}

seedFruits();
