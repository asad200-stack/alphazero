# Multi-Store SaaS E-Commerce Platform

A scalable multi-tenant SaaS platform that allows business owners to create their own store accounts and manage products, prices, images, and orders under an independent and secure dashboard. Customers can access public store links without admin permissions.

## Features

### Store Owner (Admin)
- ✅ Store profile management (logo, name, description, contact info)
- ✅ Product catalog with unlimited products
- ✅ Product images & galleries
- ✅ Product variations (size, color, etc.)
- ✅ Prices & discounts
- ✅ Stock quantity management
- ✅ Categories & sub-categories
- ✅ Tags & search filters
- ✅ Customer inquiries management
- ✅ Store theme & appearance settings
- ✅ Secure admin dashboard with role-based access

### Platform Super Admin
- ✅ View all registered stores
- ✅ Suspend / activate stores
- ✅ View platform metrics
- ✅ Manage technical settings

### Public Store Customer
- ✅ View store products
- ✅ Filter & search products
- ✅ Switch language (English / Arabic)
- ✅ RTL layout for Arabic
- ✅ View product images & prices
- ✅ Contact store / send inquiry
- ✅ Responsive mobile layout
- ✅ SEO-friendly URLs

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **Internationalization**: Custom language switcher with RTL support
- **Deployment**: Railway-ready configuration

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Railway account (for deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd multi-store-saas-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/multistore_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important**: Generate a strong random string for `JWT_SECRET`. You can use:
```bash
openssl rand -base64 32
```

### 4. Set Up Database

Make sure PostgreSQL is running, then:

```bash
# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Or push schema directly (for development)
npm run db:push
```

### 5. Create Uploads Directory

```bash
mkdir -p public/uploads
```

### 6. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Creating Your First Store

1. Navigate to `http://localhost:3000/register`
2. Fill in your details:
   - Your name
   - Email address
   - Password (minimum 6 characters)
   - Store name
   - Store URL slug (optional)
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the admin dashboard

## Admin Dashboard Access

- **Store Owner**: `/admin` - Manage your store, products, and settings
- **Super Admin**: `/admin` - Manage all stores and platform settings

## Public Store Access

Each store has a public URL:
```
http://localhost:3000/store/[store-slug]
```

Example:
```
http://localhost:3000/store/my-awesome-store
```

## Railway Deployment

### 1. Prepare Your Repository

Make sure all your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Create Railway Project

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will automatically detect Next.js

### 3. Set Up PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service

### 4. Configure Environment Variables

In your Railway project settings, add these environment variables:

```
DATABASE_URL=<your-railway-postgres-url>
JWT_SECRET=<generate-a-strong-random-string>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

**Generate JWT_SECRET**:
```bash
openssl rand -base64 32
```

### 5. Run Database Migrations

After deployment, you need to run database migrations. You can do this via Railway's CLI or by adding a one-time command:

1. In Railway, go to your service
2. Click "Settings" → "Deploy"
3. Add a "Deploy Command" (optional, or run manually):
   ```bash
   npx prisma migrate deploy && npm start
   ```

Or use Railway CLI:
```bash
railway run npx prisma migrate deploy
```

### 6. Build and Deploy

Railway will automatically:
1. Detect your Next.js project
2. Install dependencies
3. Run `npm run build`
4. Start the application with `npm start`

### 7. Verify Deployment

1. Check Railway logs for any errors
2. Visit your Railway app URL
3. Test registration and login
4. Verify database connection

## Database Migrations

### Development

```bash
# Create a new migration
npm run db:migrate

# Apply migrations
npm run db:push
```

### Production (Railway)

```bash
# Using Railway CLI
railway run npx prisma migrate deploy

# Or via Railway dashboard terminal
npx prisma migrate deploy
```

## Project Structure

```
├── app/
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes
│   ├── store/              # Public storefront pages
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── layout.tsx          # Root layout
├── components/             # Reusable React components
├── lib/                    # Utility functions and helpers
│   ├── auth.ts             # Authentication utilities
│   ├── prisma.ts           # Prisma client
│   ├── utils.ts            # General utilities
│   └── validations.ts      # Zod schemas
├── prisma/
│   └── schema.prisma       # Database schema
├── public/
│   └── uploads/            # Uploaded images (gitignored)
└── README.md
```

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Tenant isolation (store owners can only access their own data)
- ✅ CSRF protection (Next.js built-in)
- ✅ Input validation with Zod
- ✅ Secure file upload restrictions
- ✅ Environment variable protection

## Language Support

- **Admin Dashboard**: English only
- **Public Store**: English and Arabic with RTL support
- Language preference stored in localStorage
- Automatic RTL layout switching for Arabic

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new store owner
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (admin)
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product
- `PUT /api/products/[id]` - Update product
- `POST /api/products/[id]/delete` - Delete product

### Categories
- `GET /api/categories` - List categories (admin)
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `POST /api/categories/[id]/delete` - Delete category

### Stores
- `PUT /api/stores/[id]` - Update store settings

### Inquiries
- `POST /api/inquiries` - Submit customer inquiry

### Upload
- `POST /api/upload` - Upload image file

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check PostgreSQL is running
3. Ensure database exists
4. Run `npm run db:push` to sync schema

### Authentication Issues

1. Clear browser cookies
2. Verify `JWT_SECRET` is set
3. Check session cookie settings

### Image Upload Issues

1. Ensure `public/uploads` directory exists
2. Check file permissions
3. Verify file size limits (max 5MB)
4. Check file type restrictions (images only)

### Build Errors

1. Clear `.next` directory: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Regenerate Prisma client: `npm run db:generate`

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `NODE_ENV` | Environment (development/production) | No | development |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application | No | http://localhost:3000 |

## Future Enhancements

- [ ] Order management system
- [ ] Online payment integration
- [ ] Shopping cart functionality
- [ ] Wishlist feature
- [ ] Product export to CSV/Excel
- [ ] Bulk product import
- [ ] QR code generator for store links
- [ ] Analytics dashboard
- [ ] Product views & click counter
- [ ] Custom domain mapping
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Advanced search filters

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Railway deployment logs
3. Check database connection and migrations
4. Verify environment variables are set correctly

## Demo Accounts

After deployment, you can create demo accounts:
1. Register at `/register`
2. Create a store
3. Add products
4. View public store at `/store/[your-slug]`

---

**Built with ❤️ using Next.js, Prisma, and PostgreSQL**

