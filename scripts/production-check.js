#!/usr/bin/env node

/**
 * Production Readiness Check
 * Validates environment configuration before starting the application
 */

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'DYNAMODB_USERS_TABLE',
  'DYNAMODB_PRODUCTS_TABLE',
  'JWT_SECRET',
  'JWT_EXPIRATION',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'LOG_LEVEL',
];

const productionChecks = {
  NODE_ENV: (value) => value === 'production',
  JWT_SECRET: (value) => {
    if (value.includes('dev') || value.includes('change') || value.length < 32) {
      return 'JWT_SECRET must be a strong 256-bit key (not a dev key)';
    }
    return true;
  },
  LOG_LEVEL: (value) => {
    if (!['error', 'warn', 'info'].includes(value)) {
      return 'LOG_LEVEL should be error, warn, or info in production (not debug)';
    }
    return true;
  },
  DYNAMODB_USERS_TABLE: (value) => {
    if (value.startsWith('dev-')) {
      return 'Use prod- prefix for production tables';
    }
    return true;
  },
  DYNAMODB_PRODUCTS_TABLE: (value) => {
    if (value.startsWith('dev-')) {
      return 'Use prod- prefix for production tables';
    }
    return true;
  },
};

function checkEnvironment() {
  console.log('🔍 Running production readiness checks...\n');

  const errors = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      errors.push(`❌ Missing required environment variable: ${varName}`);
    }
  });

  // Run production-specific checks
  if (process.env.NODE_ENV === 'production') {
    Object.entries(productionChecks).forEach(([varName, checkFn]) => {
      const value = process.env[varName];
      if (value) {
        const result = checkFn(value);
        if (result !== true) {
          warnings.push(`⚠️  ${varName}: ${result}`);
        }
      }
    });
  }

  // Display results
  if (errors.length > 0) {
    console.error('❌ CRITICAL ERRORS:\n');
    errors.forEach((err) => console.error(err));
    console.error('\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  WARNINGS:\n');
    warnings.forEach((warn) => console.warn(warn));
    console.warn('\n');
    
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot start in production with warnings. Fix them first.\n');
      process.exit(1);
    }
  }

  console.log('✅ All checks passed!\n');
}

checkEnvironment();
