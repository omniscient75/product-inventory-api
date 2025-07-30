# Quick Railway Deployment Guide

## 🚀 Deploy in 5 Minutes

This guide will get your Product Inventory API deployed to Railway in under 5 minutes.

## Prerequisites

- [Railway account](https://railway.app/) (free)
- [GitHub account](https://github.com/) (free)
- [MongoDB Atlas account](https://www.mongodb.com/atlas) (free)

## Step 1: Prepare Your Code

```bash
# Commit all changes
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Deploy to Railway

### Option A: Using Railway Dashboard (Recommended)

1. **Go to [Railway.app](https://railway.app)**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository** (product-inventory-api)
5. **Click "Deploy Now"**

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy (run from project root)
railway up
```

## Step 3: Set Up MongoDB Atlas

1. **Create MongoDB Atlas account** at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create a new cluster** (M0 Free tier)
3. **Create database user**:
   - Username: `product-inventory-user`
   - Password: Generate a strong password
   - Role: "Read and write to any database"
4. **Configure network access**:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
5. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

## Step 4: Configure Environment Variables

In your Railway dashboard:

1. **Go to Variables tab**
2. **Add these variables**:

```env
MONGODB_URI=mongodb+srv://product-inventory-user:<YOUR_PASSWORD>@cluster0.xxxxx.mongodb.net/product-inventory?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-for-production-minimum-32-characters
NODE_ENV=production
```

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 5: Test Your Deployment

### Get Your API URL

Your API will be available at: `https://your-app-name.railway.app`

### Test Health Check

```bash
curl https://your-app-name.railway.app/api/health
```

### Test User Registration

```bash
curl -X POST https://your-app-name.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

## Step 6: Run Automated Tests

```bash
# Test your deployment
node scripts/test-deployment.js https://your-app-name.railway.app
```

## 🎉 You're Done!

Your Product Inventory API is now live on Railway!

### Your API Endpoints

- **Health Check**: `GET /api/health`
- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Products**: `GET /api/products` (requires auth)
- **Create Product**: `POST /api/products` (requires auth)

### Next Steps

1. **Set up custom domain** (optional)
2. **Configure monitoring** in Railway dashboard
3. **Set up alerts** for production
4. **Connect your frontend** to the API

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Railway logs for errors |
| Database connection fails | Verify MONGODB_URI is correct |
| Authentication errors | Check JWT_SECRET is set |
| CORS errors | Update ALLOWED_ORIGINS variable |

### Get Help

- [Railway Documentation](https://docs.railway.app/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Full Deployment Guide](./RAILWAY_DEPLOYMENT.md)

## Cost

- **Railway**: Free tier available
- **MongoDB Atlas**: Free tier available
- **Total**: $0/month for development and small production apps

---

**Deployment Time**: ~5 minutes  
**Cost**: Free  
**Difficulty**: Easy 