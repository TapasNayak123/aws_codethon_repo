import { JSONSchemaType } from 'ajv';

interface RegisterBody {
  fullName: string;
  dateOfBirth: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface UpdateProfileBody {
  fullName?: string;
  dateOfBirth?: string;
}

export const registerSchema: JSONSchemaType<RegisterBody> = {
  type: 'object',
  properties: {
    fullName: { type: 'string', minLength: 2, maxLength: 100 },
    dateOfBirth: { type: 'string', format: 'date' },
    email: { type: 'string', format: 'email', maxLength: 254 },
    password: { type: 'string', minLength: 8, maxLength: 128 },
  },
  required: ['fullName', 'dateOfBirth', 'email', 'password'],
  additionalProperties: false,
};

export const loginSchema: JSONSchemaType<LoginBody> = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 254 },
    password: { type: 'string', minLength: 1 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
};

export const updateProfileSchema: JSONSchemaType<UpdateProfileBody> = {
  type: 'object',
  properties: {
    fullName: { type: 'string', minLength: 2, maxLength: 100, nullable: true },
    dateOfBirth: { type: 'string', format: 'date', nullable: true },
  },
  required: [],
  additionalProperties: false,
  minProperties: 1,
};
