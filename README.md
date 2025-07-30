# Product Inventory API

A comprehensive Node.js backend API for product inventory management with authentication, authorization, and advanced inventory tracking features.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: Full CRUD operations for products with SKU tracking
- **Inventory Management**: Real-time stock tracking with low stock alerts
- **Advanced Filtering**: Search, filter, and pagination for products
- **Inventory Statistics**: Comprehensive analytics and reporting
- **Input Validation**: Robust validation using Joi and Express Validator
- **Security**: Helmet.js for security headers, bcrypt for password hashing, rate limiting
- **Error Handling**: Comprehensive error handling with custom error classes
- **Health Monitoring**: System health checks and monitoring
- **Request Logging**: Detailed request/response logging
- **Database**: MongoDB with Mongoose ODM

## 📁 Project Structure

```
product-inventory-api/
├── config/
│   └── database.js                    # MongoDB connection configuration
├── controllers/
│   ├── auth.js                        # Authentication controller
│   ├── product.js                     # Product management controller
│   └── health.js                      # Health check controller
├── middleware/
│   ├── auth.js                        # JWT authentication middleware
│   ├── validation.js                  # Request validation middleware
│   ├── errorHandler.js                # Global error handling
│   └── security.js                    # Security middleware (rate limiting, etc.)
├── models/
│   ├── User.js                        # User model with password hashing
│   └── Product.js                     # Product model with inventory tracking
├── routes/
│   ├── auth.js                        # Authentication routes
│   ├── product.js                     # Product management routes
│   └── health.js                      # Health check routes
├── utils/
│   └── errors.js                      # Custom error classes
├── tests/                             # Test files (Jest)
├── server.js                          # Main application entry point
├── package.json                       # Project dependencies and scripts
├── Product_Inventory_API.postman_collection.json  # Postman collection
├── Product_Inventory_API.postman_environment.json # Postman environment
└── README.md                          # Project documentation
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd product-inventory-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/product-inventory

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Bcrypt Configuration
   BCRYPT_ROUNDS=12

   # Security Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Health Check Routes (`/api/health`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Basic health check | No |
| GET | `/detailed` | Detailed system health | No |

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| POST | `/register` | Register new user | No | 5/15min |
| POST | `/login` | User login | No | 5/15min |
| GET | `/profile` | Get user profile | Yes | 100/15min |
| PUT | `/profile` | Update user profile | Yes | 100/15min |

### Product Routes (`/api/products`)

| Method | Endpoint | Description | Auth Required | Rate Limit |
|--------|----------|-------------|---------------|------------|
| POST | `/` | Create new product | Yes | 100/15min |
| GET | `/` | Get all products (with filtering) | Yes | 100/15min |
| GET | `/stats` | Get inventory statistics | Yes | 100/15min |
| GET | `/:id` | Get single product | Yes | 100/15min |
| PUT | `/:id` | Update product | Yes | 100/15min |
| DELETE | `/:id` | Delete product (soft delete) | Yes | 100/15min |
| PATCH | `/:id/quantity` | Update product quantity | Yes | 100/15min |

## 🔧 Usage Examples

### Health Check
```bash
# Basic health check
curl -X GET http://localhost:3000/api/health

# Detailed health check
curl -X GET http://localhost:3000/api/health/detailed
```

### User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Laptop",
    "price": 999.99,
    "quantity": 10
  }'
```

### Get Products with Filtering
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10&category=Electronics&search=laptop" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Product Quantity
```bash
curl -X PATCH http://localhost:3000/api/products/PRODUCT_ID/quantity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "quantity": 15,
    "operation": "set"
  }'
```

### Get Inventory Statistics
```bash
curl -X GET http://localhost:3000/api/products/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Postman Collection
Import the provided Postman collection for comprehensive API testing:

1. **Import Collection**: `Product_Inventory_API.postman_collection.json`
2. **Import Environment**: `Product_Inventory_API.postman_environment.json`
3. **Set Environment**: Select "Product Inventory API - Development"
4. **Start Testing**: Begin with Health Check, then Authentication, then Products

### Test Workflow
1. **Health Check** → Verify API is running
2. **Register User** → Create test account
3. **Login** → Get authentication token
4. **Create Product** → Add test product
5. **Get Products** → List user's products
6. **Update Product** → Modify product details
7. **Get Stats** → View inventory statistics

## 📊 Features in Detail

### Health Monitoring
- **System Health**: Database connection, memory usage, CPU load
- **API Performance**: Response time tracking
- **Detailed Metrics**: Comprehensive system statistics
- **Real-time Monitoring**: Live health status updates

### Product Management
- **SKU Tracking**: Unique SKU for each product
- **Inventory Levels**: Current quantity, minimum quantity, maximum quantity
- **Pricing**: Cost and selling price with profit margin calculation
- **Categories**: Product categorization
- **Supplier Information**: Supplier name and contact details
- **Location Tracking**: Physical location of products

### Inventory Features
- **Stock Status**: Automatic calculation (in-stock, low-stock, out-of-stock)
- **Quantity Operations**: Add, subtract, or set quantity
- **Low Stock Alerts**: Products below minimum quantity
- **Inventory Statistics**: Total value, cost, and stock analytics

### Security Features
- **Password Hashing**: Bcrypt with configurable rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: User and admin roles
- **Input Validation**: Comprehensive request validation with Express Validator
- **Security Headers**: Helmet.js protection
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Configurable cross-origin requests
- **Request Logging**: Detailed audit trail

### Error Handling
- **Custom Error Classes**: Specific error types with proper HTTP status codes
- **Global Error Handler**: Centralized error processing
- **Development vs Production**: Different error detail levels
- **Validation Errors**: Comprehensive input validation feedback
- **Database Error Handling**: MongoDB error processing

### Advanced Features
- **Pagination**: Efficient data loading
- **Search & Filter**: Multi-field search and filtering
- **Sorting**: Configurable sorting options
- **Soft Delete**: Products marked as inactive instead of deleted
- **Audit Trail**: Created by and timestamps
- **User Ownership**: Users can only access their own products

## 🔒 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/product-inventory | **Yes** |
| `JWT_SECRET` | JWT signing secret | - | **Yes** |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d | No |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000,http://localhost:3001 | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.

## 📋 API Response Formats

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response (Development)
```json
{
  "status": "error",
  "message": "Specific error message",
  "error": { ... },
  "stack": "..."
}
```

### Error Response (Production)
```json
{
  "status": "error",
  "message": "Something went wrong!"
}
```

## 🔐 Security Considerations

- **Rate Limiting**: Authentication endpoints are rate-limited to prevent brute force attacks
- **Input Validation**: All inputs are validated and sanitized
- **JWT Security**: Tokens expire after 7 days by default
- **Password Security**: Passwords are hashed using bcrypt with 12 rounds
- **CORS**: Configurable cross-origin request policies
- **Security Headers**: Comprehensive security headers via Helmet.js 