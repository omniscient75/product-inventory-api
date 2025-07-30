# Environment Variables Documentation

## Overview

This document provides detailed information about all environment variables used in the Product Inventory API. These variables control various aspects of the application including security, database connections, and operational settings.

## Quick Setup

1. Copy `.env.example` to `.env`
2. Update the values according to your environment
3. Never commit the `.env` file to version control

## Environment Variables Reference

### Server Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `PORT` | Number | 3000 | No | Port number for the server to listen on |
| `NODE_ENV` | String | development | No | Application environment (development/production/test) |

### Database Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `MONGODB_URI` | String | - | **Yes** | MongoDB connection string |
| `MONGODB_URI_TEST` | String | - | No | Test database connection string |

### JWT Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `JWT_SECRET` | String | - | **Yes** | Secret key for JWT token signing |
| `JWT_EXPIRES_IN` | String | 7d | No | JWT token expiration time |

### Security Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `BCRYPT_ROUNDS` | Number | 12 | No | Password hashing salt rounds |
| `ALLOWED_ORIGINS` | String | - | No | CORS allowed origins |

### Rate Limiting

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `GENERAL_RATE_LIMIT` | Number | 100 | No | General API rate limit |
| `AUTH_RATE_LIMIT` | Number | 5 | No | Authentication rate limit |
| `RATE_LIMIT_WINDOW_MS` | Number | 900000 | No | Rate limit time window |

### Logging Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `ENABLE_REQUEST_LOGGING` | Boolean | true | No | Enable request logging |
| `LOG_LEVEL` | String | info | No | Application log level |

### Application Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `APP_NAME` | String | Product Inventory API | No | Application name |
| `APP_VERSION` | String | 1.0.0 | No | Application version |
| `MAX_FILE_SIZE` | Number | 10485760 | No | Maximum file upload size |

### Development Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `SHOW_DETAILED_ERRORS` | Boolean | true | No | Show detailed error messages |
| `ENABLE_DB_LOGGING` | Boolean | false | No | Enable database query logging |

### Testing Configuration

| Variable | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `SUPPRESS_LOGS` | Boolean | false | No | Suppress console logs during tests |
| `TEST_TIMEOUT` | Number | 10000 | No | Test timeout in milliseconds |

## Detailed Descriptions

### Server Configuration

#### `PORT`
- **Purpose**: Specifies the port number on which the server will listen for incoming HTTP requests
- **Format**: Integer (1024-65535)
- **Examples**: 3000, 8080, 5000
- **Security Note**: Avoid using ports below 1024 (privileged ports) unless necessary

#### `NODE_ENV`
- **Purpose**: Determines the application's environment mode
- **Options**: 
  - `development`: Detailed error messages, debug logging, development features
  - `production`: Minimal error details, optimized performance, security features
  - `test`: Testing environment with test database and minimal logging
- **Impact**: Affects error handling, logging, and feature availability

### Database Configuration

#### `MONGODB_URI`
- **Purpose**: Connection string for MongoDB database
- **Format**: `mongodb://[username:password@]host[:port]/database_name`
- **Examples**:
  - Local: `mongodb://localhost:27017/product-inventory`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/product-inventory`
  - Docker: `mongodb://mongo:27017/product-inventory`
- **Security**: Never commit this value to version control

#### `MONGODB_URI_TEST`
- **Purpose**: Separate database for running tests
- **Default**: Uses same connection as `MONGODB_URI` with `-test` suffix
- **Recommendation**: Always use a separate test database

### JWT Configuration

#### `JWT_SECRET`
- **Purpose**: Secret key for signing and verifying JWT tokens
- **Requirements**: 
  - Minimum 32 characters (recommended 256+)
  - Random and unpredictable
  - Unique per environment
- **Security**: Critical for application security - never share or commit

#### `JWT_EXPIRES_IN`
- **Purpose**: Token expiration time
- **Format**: Number followed by time unit (s, m, h, d)
- **Examples**: 1h, 24h, 7d, 30d
- **Security**: Shorter times are more secure but require more frequent logins

### Security Configuration

#### `BCRYPT_ROUNDS`
- **Purpose**: Number of salt rounds for password hashing
- **Range**: 10-14 (recommended: 12)
- **Performance Impact**:
  - 10 rounds: ~100ms hash time
  - 12 rounds: ~250ms hash time (recommended)
  - 14 rounds: ~1s hash time (very secure)

#### `ALLOWED_ORIGINS`
- **Purpose**: CORS (Cross-Origin Resource Sharing) configuration
- **Format**: Comma-separated list of origins
- **Examples**:
  - Single: `http://localhost:3000`
  - Multiple: `http://localhost:3000,https://myapp.com`
  - All: `*` (not recommended for production)

### Rate Limiting

#### `GENERAL_RATE_LIMIT`
- **Purpose**: Maximum requests per time window for general API endpoints
- **Default**: 100 requests per 15 minutes
- **Adjustment**: Increase for high-traffic applications

#### `AUTH_RATE_LIMIT`
- **Purpose**: Stricter rate limit for authentication endpoints
- **Default**: 5 requests per 15 minutes
- **Security**: Prevents brute force attacks

#### `RATE_LIMIT_WINDOW_MS`
- **Purpose**: Time window for rate limiting in milliseconds
- **Default**: 900000 (15 minutes)
- **Examples**: 300000 (5 min), 900000 (15 min), 3600000 (1 hour)

### Logging Configuration

#### `ENABLE_REQUEST_LOGGING`
- **Purpose**: Enable/disable HTTP request logging
- **Default**: true
- **Performance**: Set to false in production for better performance

#### `LOG_LEVEL`
- **Purpose**: Control application log verbosity
- **Options**: error, warn, info, debug
- **Recommendations**:
  - Development: debug
  - Production: warn or error

### Application Configuration

#### `APP_NAME`
- **Purpose**: Application name used in responses and logs
- **Default**: "Product Inventory API"
- **Usage**: Appears in API responses and log messages

#### `APP_VERSION`
- **Purpose**: Application version for tracking and debugging
- **Default**: "1.0.0"
- **Usage**: Version tracking and API documentation

#### `MAX_FILE_SIZE`
- **Purpose**: Maximum file upload size in bytes
- **Default**: 10485760 (10MB)
- **Examples**: 5242880 (5MB), 20971520 (20MB)

### Development Configuration

#### `SHOW_DETAILED_ERRORS`
- **Purpose**: Show detailed error messages and stack traces
- **Default**: true (when NODE_ENV=development)
- **Security**: Always false in production

#### `ENABLE_DB_LOGGING`
- **Purpose**: Log database queries for debugging
- **Default**: false
- **Performance**: Can impact performance when enabled

### Testing Configuration

#### `SUPPRESS_LOGS`
- **Purpose**: Suppress console output during tests
- **Default**: false
- **Usage**: Reduces test output noise

#### `TEST_TIMEOUT`
- **Purpose**: Maximum time for individual tests
- **Default**: 10000 (10 seconds)
- **Examples**: 5000, 10000, 30000

## Environment-Specific Configurations

### Development Environment
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/product-inventory-dev
JWT_SECRET=dev-secret-key-change-in-production
SHOW_DETAILED_ERRORS=true
ENABLE_DB_LOGGING=true
LOG_LEVEL=debug
```

### Production Environment
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/product-inventory
JWT_SECRET=your-very-long-and-secure-secret-key-here
SHOW_DETAILED_ERRORS=false
ENABLE_DB_LOGGING=false
LOG_LEVEL=warn
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Testing Environment
```env
NODE_ENV=test
MONGODB_URI_TEST=mongodb://localhost:27017/product-inventory-test
JWT_SECRET=test-secret-key
SUPPRESS_LOGS=true
TEST_TIMEOUT=10000
```

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use strong, unique secrets** for JWT_SECRET in production
3. **Use environment-specific databases** for development, testing, and production
4. **Restrict CORS origins** to your actual frontend domains
5. **Use appropriate log levels** for different environments
6. **Regularly rotate secrets** in production environments
7. **Use secure connection strings** for production databases

## Troubleshooting

### Common Issues

1. **MONGODB_URI not set**: Application will exit with helpful error message
2. **JWT_SECRET not set**: Authentication will fail
3. **Invalid CORS origins**: Frontend requests will be blocked
4. **Rate limiting too strict**: Legitimate requests may be blocked

### Validation

The application validates critical environment variables on startup:
- `MONGODB_URI` must be provided
- `JWT_SECRET` must be provided
- Port must be a valid number
- Database connection must be successful

## Related Documentation

- [API Documentation](./README.md)
- [Security Guidelines](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md) 