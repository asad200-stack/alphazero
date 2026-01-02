# Deployment Guide - Railway

This guide will walk you through deploying the Multi-Store SaaS Platform to Railway.

## Prerequisites

- GitHub account with your code repository
- Railway account (sign up at [railway.app](https://railway.app))
- PostgreSQL database (Railway provides this)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure all your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select your repository
6. Railway will automatically detect it's a Next.js project

### 3. Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL database
4. Click on the database service
5. Go to the **"Variables"** tab
6. Copy the `DATABASE_URL` value

### 4. Configure Environment Variables

1. Click on your Next.js service (not the database)
2. Go to the **"Variables"** tab
3. Add the following environment variables:

```
DATABASE_URL=<paste-the-database-url-from-step-3>
JWT_SECRET=<generate-a-strong-random-string>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-name.railway.app
```

**Generate JWT_SECRET:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use an online generator
# https://randomkeygen.com/
```

**Important**: Replace `your-app-name` with your actual Railway app domain.

### 5. Configure Build Settings

Railway should auto-detect Next.js, but verify:

1. Go to your service **"Settings"**
2. Under **"Build Command"**, it should be: `npm run build`
3. Under **"Start Command"**, it should be: `npm start`

### 6. Run Database Migrations

After the first deployment, you need to run database migrations:

**Option A: Using Railway CLI**

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

**Option B: Using Railway Dashboard**

1. Go to your service
2. Click **"Deployments"**
3. Click on the latest deployment
4. Click **"View Logs"**
5. In the terminal, run:
   ```bash
   npx prisma migrate deploy
   ```

### 7. Verify Deployment

1. Check Railway logs for any errors
2. Visit your Railway app URL (shown in the service overview)
3. Test registration: `/register`
4. Test login: `/login`
5. Verify database connection by creating a store

### 8. Custom Domain (Optional)

1. Go to your service **"Settings"**
2. Scroll to **"Domains"**
3. Click **"Generate Domain"** or **"Add Custom Domain"**
4. Follow Railway's instructions for DNS configuration

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables set correctly
- [ ] App is accessible via Railway URL
- [ ] Registration works
- [ ] Login works
- [ ] Store creation works
- [ ] Product creation works
- [ ] Public store link works
- [ ] Image uploads work
- [ ] Language switcher works (EN/AR)

## Troubleshooting

### Build Fails

**Error**: `Module not found` or `Cannot find module`

**Solution**: 
- Check that all dependencies are in `package.json`
- Railway should run `npm install` automatically
- Check build logs for specific missing modules

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
- Verify `DATABASE_URL` is correct
- Ensure database service is running
- Check that database and app are in the same Railway project

### Migration Errors

**Error**: `Migration failed` or `Schema is out of sync`

**Solution**:
```bash
# Reset and push schema (WARNING: This will delete data)
railway run npx prisma migrate reset

# Or push schema directly
railway run npx prisma db push
```

### Image Upload Not Working

**Error**: Images not saving or 404 errors

**Solution**:
- Railway uses ephemeral filesystem
- Consider using Railway's volume storage or external storage (S3)
- For production, configure external storage in `/api/upload/route.ts`

### Environment Variables Not Working

**Error**: `process.env.VARIABLE is undefined`

**Solution**:
- Restart the service after adding variables
- Ensure variable names match exactly (case-sensitive)
- For `NEXT_PUBLIC_*` variables, rebuild the app

## Production Recommendations

1. **Use External Storage**: Configure S3 or similar for image uploads
2. **Enable HTTPS**: Railway provides this automatically
3. **Set Up Monitoring**: Use Railway's built-in monitoring
4. **Backup Database**: Set up regular database backups
5. **Rate Limiting**: Consider adding rate limiting for API routes
6. **Error Tracking**: Integrate error tracking (Sentry, etc.)

## Scaling

Railway automatically scales your application, but consider:

- Database connection pooling
- CDN for static assets
- Caching strategies
- Load balancing (Railway handles this)

## Support

If you encounter issues:

1. Check Railway logs: Service → Deployments → View Logs
2. Check Railway status: [status.railway.app](https://status.railway.app)
3. Railway Discord: [discord.gg/railway](https://discord.gg/railway)
4. Railway Docs: [docs.railway.app](https://docs.railway.app)

---

**Happy Deploying! 🚀**

