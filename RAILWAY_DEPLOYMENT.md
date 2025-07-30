# Railway Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Product Inventory API to Railway. Railway is a modern platform that makes it easy to deploy Node.js applications with automatic scaling and database provisioning.

## Prerequisites

- [Railway account](https://railway.app/) (free tier available)
- [GitHub account](https://github.com/) (for code repository)
- [MongoDB Atlas account](https://www.mongodb.com/atlas) (for production database)

## Step 1: Prepare Your Code Repository

### 1.1 Commit All Changes

```bash
# Ensure all files are committed to Git
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 1.2 Verify Required Files

Ensure these files are in your repository root:
- ✅ `package.json` (with proper scripts and engines)
- ✅ `server.js` (main application file)
- ✅ `railway.json` (Railway configuration)
- ✅ `Procfile` (process definition)
- ✅ `.nixpacks` (build configuration)
- ✅ `.gitignore` (excludes node_modules and .env)

## Step 2: Set Up MongoDB Atlas (Production Database)

### 2.1 Create MongoDB Atlas Cluster

1. **Sign up/Login** to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create a new project** (if needed)
3. **Build a new cluster**:
   - Choose **M0 Free** tier (512MB storage)
   - Select your preferred cloud provider and region
   - Click **"Create Cluster"**

### 2.2 Configure Database Access

1. **Go to Database Access** in the left sidebar
2. **Add New Database User**:
   - Username: `product-inventory-user`
   - Password: Generate a strong password
   - Role: **"Read and write to any database"**
   - Click **"Add User"**

### 2.3 Configure Network Access

1. **Go to Network Access** in the left sidebar
2. **Add IP Address**:
   - Click **"Add IP Address"**
   - Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click **"Confirm"**

### 2.4 Get Connection String

1. **Go to Database** in the left sidebar
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Copy the connection string** (it looks like):
   ```
   mongodb+srv://product-inventory-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 3: Deploy to Railway

### 3.1 Connect GitHub Repository

1. **Login to Railway** at [railway.app](https://railway.app)
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository** (product-inventory-api)
5. **Click "Deploy Now"**

### 3.2 Configure Environment Variables

Once your project is created, go to the **Variables** tab and add these environment variables:

#### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://product-inventory-user:<YOUR_PASSWORD>@cluster0.xxxxx.mongodb.net/product-inventory?retryWrites=true&w=majority` | Replace `<YOUR_PASSWORD>` with your actual MongoDB password |
| `JWT_SECRET` | `your-super-secure-jwt-secret-key-for-production-minimum-32-characters` | Generate a strong, random string (min 32 chars) |
| `NODE_ENV` | `production` | Set to production mode |

#### Optional Variables (Recommended)

| Variable | Value | Description |
|----------|-------|-------------|
| `BCRYPT_ROUNDS` | `12` | Password hashing rounds |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration |
| `ALLOWED_ORIGINS` | `https://your-frontend-domain.com` | Your frontend domain(s) |
| `GENERAL_RATE_LIMIT` | `100` | API rate limit |
| `AUTH_RATE_LIMIT` | `5` | Authentication rate limit |
| `ENABLE_REQUEST_LOGGING` | `true` | Enable request logging |
| `LOG_LEVEL` | `info` | Log level |

### 3.3 Generate Secure JWT Secret

```bash
# Generate a secure JWT secret (run this in your terminal)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use the output as your `JWT_SECRET` value.

### 3.4 Deploy the Application

1. **Railway will automatically detect** your Node.js application
2. **Build process** will install dependencies
3. **Deployment** will start automatically
4. **Monitor the logs** in the Railway dashboard

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Custom Domain

1. **Go to Settings** in your Railway project
2. **Click "Domains"**
3. **Add your custom domain** (e.g., `api.yourdomain.com`)
4. **Configure DNS** as instructed by Railway

### 4.2 Update CORS Settings

If using a custom domain, update your `ALLOWED_ORIGINS` variable:
```
https://yourdomain.com,https://www.yourdomain.com
```

## Step 5: Post-Deployment Testing

### 5.1 Health Check

Test the basic health endpoint:
```bash
# Replace with your Railway URL
curl https://your-app-name.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "uptime": 123.456,
  "database": {
    "status": "connected"
  }
}
```

### 5.2 Authentication Testing

Test user registration:
```bash
curl -X POST https://your-app-name.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### 5.3 Database Connection Test

Check if the application can connect to MongoDB:
```bash
curl https://your-app-name.railway.app/api/health/detailed
```

Look for `"database": { "status": "connected" }` in the response.

## Step 6: Monitoring and Maintenance

### 6.1 Railway Dashboard Monitoring

- **Logs**: Monitor application logs in real-time
- **Metrics**: Track CPU, memory, and network usage
- **Deployments**: View deployment history and status

### 6.2 Set Up Alerts

1. **Go to Settings** → **Alerts**
2. **Configure alerts** for:
   - High CPU usage
   - High memory usage
   - Failed deployments
   - Health check failures

### 6.3 Database Monitoring

1. **MongoDB Atlas Dashboard**:
   - Monitor database performance
   - Set up alerts for storage usage
   - Track query performance

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Build fails during deployment
**Solution**:
- Check Railway logs for specific errors
- Verify `package.json` has correct scripts
- Ensure all dependencies are in `dependencies` (not `devDependencies`)

#### 2. Database Connection Issues

**Problem**: Application can't connect to MongoDB
**Solution**:
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access settings
- Ensure database user has correct permissions

#### 3. Environment Variables Not Set

**Problem**: Application crashes due to missing variables
**Solution**:
- Verify all required variables are set in Railway
- Check variable names match exactly (case-sensitive)
- Restart deployment after adding variables

#### 4. CORS Issues

**Problem**: Frontend can't access API
**Solution**:
- Update `ALLOWED_ORIGINS` with your frontend domain
- Ensure protocol (http/https) matches
- Check for trailing slashes

### Debug Commands

```bash
# Check Railway logs
railway logs

# View environment variables
railway variables

# Restart deployment
railway up

# Check service status
railway status
```

## Security Checklist

- ✅ **JWT_SECRET** is strong and unique
- ✅ **MONGODB_URI** uses secure connection
- ✅ **NODE_ENV** is set to production
- ✅ **CORS origins** are restricted to your domains
- ✅ **Rate limiting** is enabled
- ✅ **Database user** has minimal required permissions
- ✅ **Environment variables** are not exposed in logs

## Performance Optimization

### 1. Enable Caching

Consider adding Redis for session caching:
```bash
# Add Redis service in Railway
railway add redis
```

### 2. Database Indexing

Ensure MongoDB indexes are created:
```javascript
// These are already defined in your models
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
```

### 3. Compression

Enable gzip compression for responses:
```javascript
// Add to server.js
app.use(compression());
```

## Backup Strategy

### 1. Database Backups

- **MongoDB Atlas**: Automatic backups enabled by default
- **Manual backups**: Export data periodically
- **Point-in-time recovery**: Available with Atlas

### 2. Code Backups

- **GitHub**: Primary code repository
- **Railway**: Automatic deployments from Git
- **Local backups**: Keep local copies

## Cost Optimization

### 1. Railway Free Tier

- **Deployments**: Unlimited
- **Bandwidth**: 100GB/month
- **Build minutes**: 500/month
- **Database**: Use MongoDB Atlas free tier

### 2. MongoDB Atlas Free Tier

- **Storage**: 512MB
- **Connections**: 500
- **Perfect for development and small production apps**

## Next Steps

1. **Set up CI/CD** with GitHub Actions
2. **Add monitoring** with external services
3. **Implement logging** with services like LogRocket
4. **Set up staging environment** for testing
5. **Configure SSL certificates** (automatic with Railway)

## Support Resources

- [Railway Documentation](https://docs.railway.app/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Security](https://expressjs.com/en/advanced/best-practices-security.html)

---

**Deployment Status**: ✅ Ready for Railway deployment

**Estimated Time**: 15-30 minutes for initial setup

**Cost**: Free tier available for development and small production apps 