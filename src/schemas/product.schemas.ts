import { JSONSchemaType } from 'ajv';

interface CreateProductBody {
  productName: string;
  category: string;
  price: number;
  availableQuantity: number;
  description: string;
  imageUrl: string;
}

interface UpdateProductBody {
  productName?: string;
  category?: string;
  price?: number;
  availableQuantity?: number;
  description?: string;
  imageUrl?: string;
}

interface SearchProductsQuery {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

const productProperties = {
  productName: { type: 'string' as const, minLength: 2, maxLength: 100, pattern: '^[a-zA-Z0-9\\s\\-&\',.()]+$' },
  category: { type: 'string' as const, enum: ['Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports', 'Other'] },
  price: { type: 'number' as const, minimum: 0.01, maximum: 999999.99 },
  availableQuantity: { type: 'integer' as const, minimum: 0, maximum: 1000000 },
  description: { type: 'string' as const, minLength: 10, maxLength: 1000 },
  imageUrl: { type: 'string' as const, format: 'uri' as const, maxLength: 2048 },
};

export const createProductSchema: JSONSchemaType<CreateProductBody | CreateProductBody[]> = {
  oneOf: [
    {
      type: 'object',
      properties: productProperties,
      required: ['productName', 'category', 'price', 'availableQuantity', 'description', 'imageUrl'],
      additionalProperties: false,
    },
    {
      type: 'array',
      items: {
        type: 'object',
        properties: productProperties,
        required: ['productName', 'category', 'price', 'availableQuantity', 'description', 'imageUrl'],
        additionalProperties: false,
      },
      minItems: 1,
      maxItems: 100,
    },
  ],
} as any;

export const updateProductSchema: JSONSchemaType<UpdateProductBody> = {
  type: 'object',
  properties: {
    productName: { type: 'string', minLength: 2, maxLength: 100, pattern: '^[a-zA-Z0-9\\s\\-&\',.()]+$', nullable: true },
    category: { type: 'string', enum: ['Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports', 'Other'], nullable: true },
    price: { type: 'number', minimum: 0.01, maximum: 999999.99, nullable: true },
    availableQuantity: { type: 'integer', minimum: 0, maximum: 1000000, nullable: true },
    description: { type: 'string', minLength: 10, maxLength: 1000, nullable: true },
    imageUrl: { type: 'string', format: 'uri', maxLength: 2048, nullable: true },
  },
  required: [],
  additionalProperties: false,
  minProperties: 1,
};

export const searchProductsSchema: JSONSchemaType<SearchProductsQuery> = {
  type: 'object',
  properties: {
    q: { type: 'string', maxLength: 200, nullable: true },
    category: { type: 'string', enum: ['Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports', 'Other'], nullable: true },
    minPrice: { type: 'string', pattern: '^\\d+(\\.\\d{1,2})?$', nullable: true },
    maxPrice: { type: 'string', pattern: '^\\d+(\\.\\d{1,2})?$', nullable: true },
    page: { type: 'string', pattern: '^[1-9]\\d*$', nullable: true },
    limit: { type: 'string', pattern: '^[1-9]\\d*$', nullable: true },
    sortBy: { type: 'string', enum: ['productName', 'price', 'createdAt'], nullable: true },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], nullable: true },
  },
  required: [],
  additionalProperties: false,
};
