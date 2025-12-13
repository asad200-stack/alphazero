# دليل التثبيت المفصل

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:
- **Node.js** (الإصدار 16 أو أحدث)
- **npm** (يأتي مع Node.js)

للتحقق من التثبيت:
```bash
node --version
npm --version
```

## خطوات التثبيت

### 1. تثبيت الحزم

قم بتثبيت جميع الحزم المطلوبة:

```bash
# تثبيت حزم Backend
npm install

# تثبيت حزم Frontend
cd client
npm install
cd ..
```

أو استخدم الأمر المختصر:
```bash
npm run install-all
```

### 2. إعداد ملف البيئة

انسخ ملف `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

يمكنك تعديل الملف حسب احتياجك:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

### 3. تشغيل المشروع

#### وضع التطوير (Development)
```bash
npm run dev
```

هذا الأمر سيشغل:
- **Backend** على: `http://localhost:5000`
- **Frontend** على: `http://localhost:3000`

#### تشغيل منفصل

إذا أردت تشغيل كل جزء على حدة:

**Backend فقط:**
```bash
npm run server
```

**Frontend فقط:**
```bash
npm run client
```

## الوصول للنظام

بعد التشغيل:
1. افتح المتصفح على: `http://localhost:3000`
2. للوصول للوحة التحكم: `http://localhost:3000/admin/login`
3. استخدم البيانات الافتراضية:
   - Username: `admin`
   - Password: `admin123`

## استكشاف الأخطاء

### مشكلة: Port already in use
إذا ظهرت رسالة أن المنفذ مستخدم:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### مشكلة: Module not found
احذف `node_modules` وأعد التثبيت:
```bash
rm -rf node_modules client/node_modules
npm run install-all
```

### مشكلة: Database errors
احذف ملف قاعدة البيانات وأعد التشغيل:
```bash
rm server/database.sqlite
npm run dev
```

## البناء للإنتاج

### 1. بناء Frontend
```bash
cd client
npm run build
cd ..
```

### 2. تشغيل الإنتاج
```bash
NODE_ENV=production npm start
```

## الترقية لقاعدة بيانات MySQL

إذا أردت استخدام MySQL بدلاً من SQLite:

1. قم بتثبيت `mysql2`:
```bash
npm install mysql2
```

2. عدّل ملف `server/database.js` لاستخدام MySQL
3. أضف معلومات الاتصال في `.env`

## النشر على الخادم

### استخدام PM2
```bash
npm install -g pm2
pm2 start server/index.js --name ecommerce
pm2 save
pm2 startup
```

### استخدام Docker (اختياري)
يمكنك إنشاء `Dockerfile` للنشر في حاويات Docker.

---

**ملاحظة:** تأكد من تغيير كلمة المرور الافتراضية في الإنتاج!


