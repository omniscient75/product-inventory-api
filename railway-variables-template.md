# Railway Environment Variables Template

## Copy and Paste This Configuration

Use this template to configure your environment variables in Railway dashboard.

### Required Variables

```env
MONGODB_URI=mongodb+srv://product-inventory-user:<YOUR_PASSWORD>@cluster0.xxxxx.mongodb.net/product-inventory?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-for-production-minimum-32-characters
NODE_ENV=production
```

### Recommended Variables

```env
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://your-frontend-domain.com
GENERAL_RATE_LIMIT=100
AUTH_RATE_LIMIT=5
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=info
```

## Step-by-Step Configuration

### 1. Generate JWT Secret

Run this command in your terminal to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Set Up MongoDB Atlas

1. Create a MongoDB Atlas account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (M0 Free tier)
3. Create a database user with read/write permissions
4. Configure network access to allow connections from anywhere (0.0.0.0/0)
5. Get your connection string from the "Connect" button

### 3. Configure in Railway

1. Go to your Railway project dashboard
2. Click on the "Variables" tab
3. Add each variable one by one:

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGODB_URI` | Your MongoDB connection string | Replace `<YOUR_PASSWORD>` with actual password |
| `JWT_SECRET` | Generated secret from step 1 | Use the output from the crypto command |
| `NODE_ENV` | `production` | Set to production mode |
| `BCRYPT_ROUNDS` | `12` | Password hashing rounds |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time |
| `ALLOWED_ORIGINS` | Your frontend URL | e.g., `https://myapp.com` |
| `GENERAL_RATE_LIMIT` | `100` | API rate limit |
| `AUTH_RATE_LIMIT` | `5` | Authentication rate limit |
| `ENABLE_REQUEST_LOGGING` | `true` | Enable request logging |
| `LOG_LEVEL` | `info` | Log level |

### 4. Restart Deployment

After adding all variables, restart your deployment:

1. Go to the "Deployments" tab
2. Click "Redeploy" on the latest deployment
3. Monitor the logs for any errors

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters long
- [ ] MONGODB_URI uses secure connection (mongodb+srv://)
- [ ] NODE_ENV is set to production
- [ ] ALLOWED_ORIGINS is restricted to your domains
- [ ] Database password is strong and unique
- [ ] No sensitive data is logged

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MONGODB_URI format
   - Verify database user credentials
   - Ensure network access is configured

2. **Authentication Errors**
   - Verify JWT_SECRET is set correctly
   - Check JWT_EXPIRES_IN format
   - Ensure NODE_ENV is production

3. **CORS Errors**
   - Update ALLOWED_ORIGINS with correct domain
   - Include protocol (https://)
   - Remove trailing slashes

### Validation Commands

Test your configuration:

```bash
# Test health endpoint
curl https://your-app.railway.app/api/health

# Test database connection
curl https://your-app.railway.app/api/health/detailed

# Test authentication
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Password123"}'
```

## Example Complete Configuration

```env
# Database
MONGODB_URI=mongodb+srv://product-inventory-user:MySecurePassword123@cluster0.abc123.mongodb.net/product-inventory?retryWrites=true&w=majority

# Security
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2
NODE_ENV=production
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com

# Rate Limiting
GENERAL_RATE_LIMIT=100
AUTH_RATE_LIMIT=5

# Logging
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=info
```

## Next Steps

After configuring environment variables:

1. **Test your API** using the deployment testing script
2. **Set up monitoring** in Railway dashboard
3. **Configure custom domain** if needed
4. **Set up alerts** for production monitoring
5. **Document your deployment** for team members

For detailed instructions, see: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) 