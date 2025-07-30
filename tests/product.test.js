const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');

describe('Product Endpoints', () => {
  let authToken;
  let userId;
  let productId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/product-inventory-test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create and login user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user._id;
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const productData = {
        name: 'Test Laptop',
        price: 999.99,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Product created successfully');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('name', productData.name);
      expect(response.body.product).toHaveProperty('price', productData.price);
      expect(response.body.product).toHaveProperty('quantity', productData.quantity);
      expect(response.body.product).toHaveProperty('createdBy', userId);

      productId = response.body.product._id;
    });

    it('should return 401 without authentication', async () => {
      const productData = {
        name: 'Test Laptop',
        price: 999.99,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        name: 'A', // Too short
        price: -100, // Negative price
        quantity: -5 // Negative quantity
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      const products = [
        { name: 'Laptop', price: 999.99, quantity: 10 },
        { name: 'Mouse', price: 29.99, quantity: 50 },
        { name: 'Keyboard', price: 89.99, quantity: 25 }
      ];

      for (const product of products) {
        await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(product);
      }
    });

    it('should get all user products', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Products retrieved successfully');
      expect(response.body).toHaveProperty('products');
      expect(response.body.products).toHaveLength(3);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter products by search term', async () => {
      const response = await request(app)
        .get('/api/products?search=laptop')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Laptop');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('totalPages', 2);
    });
  });

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      // Create a test product
      const productData = {
        name: 'Test Product',
        price: 99.99,
        quantity: 5
      };

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      productId = createResponse.body.product._id;
    });

    it('should get a specific product', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Product retrieved successfully');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('_id', productId);
      expect(response.body.product).toHaveProperty('name', 'Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('PUT /api/products/:id', () => {
    beforeEach(async () => {
      // Create a test product
      const productData = {
        name: 'Original Product',
        price: 99.99,
        quantity: 5
      };

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      productId = createResponse.body.product._id;
    });

    it('should update a product successfully', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 149.99,
        quantity: 10
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Product updated successfully');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('name', updateData.name);
      expect(response.body.product).toHaveProperty('price', updateData.price);
      expect(response.body.product).toHaveProperty('quantity', updateData.quantity);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('DELETE /api/products/:id', () => {
    beforeEach(async () => {
      // Create a test product
      const productData = {
        name: 'Product to Delete',
        price: 99.99,
        quantity: 5
      };

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      productId = createResponse.body.product._id;
    });

    it('should delete a product (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Product deleted successfully');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('isActive', false);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('PATCH /api/products/:id/quantity', () => {
    beforeEach(async () => {
      // Create a test product
      const productData = {
        name: 'Quantity Test Product',
        price: 99.99,
        quantity: 10
      };

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      productId = createResponse.body.product._id;
    });

    it('should set quantity', async () => {
      const response = await request(app)
        .patch(`/api/products/${productId}/quantity`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 20, operation: 'set' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Product quantity updated successfully');
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('quantity', 20);
    });

    it('should add quantity', async () => {
      const response = await request(app)
        .patch(`/api/products/${productId}/quantity`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 5, operation: 'add' })
        .expect(200);

      expect(response.body.product).toHaveProperty('quantity', 15);
    });

    it('should subtract quantity', async () => {
      const response = await request(app)
        .patch(`/api/products/${productId}/quantity`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 3, operation: 'subtract' })
        .expect(200);

      expect(response.body.product).toHaveProperty('quantity', 7);
    });

    it('should not allow negative quantity', async () => {
      const response = await request(app)
        .patch(`/api/products/${productId}/quantity`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 15, operation: 'subtract' })
        .expect(200);

      expect(response.body.product).toHaveProperty('quantity', 0);
    });
  });

  describe('GET /api/products/stats', () => {
    beforeEach(async () => {
      // Create test products
      const products = [
        { name: 'Laptop', price: 999.99, quantity: 5 },
        { name: 'Mouse', price: 29.99, quantity: 20 },
        { name: 'Keyboard', price: 89.99, quantity: 10 }
      ];

      for (const product of products) {
        await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send(product);
      }
    });

    it('should get inventory statistics', async () => {
      const response = await request(app)
        .get('/api/products/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Inventory statistics retrieved successfully');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalProducts', 3);
      expect(response.body.stats).toHaveProperty('totalValue');
      expect(response.body.stats).toHaveProperty('lowStockProducts');
      expect(response.body.stats).toHaveProperty('outOfStockProducts');
      expect(response.body).toHaveProperty('categoryStats');
    });
  });
}); 