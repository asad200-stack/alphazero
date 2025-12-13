# ⚡ نشر سريع على Railway (5 خطوات)

## ✅ الخطوات

### 1️⃣ ارفع على GitHub (إن لم تكن فعلت)

```bash
git init
git add .
git commit -m "جاهز للنشر"
git branch -M main
git remote add origin https://github.com/asad200-stack/onlineweb.git
git push -u origin main
```

---

### 2️⃣ انشر على Railway

1. اذهب إلى: **https://railway.app**
2. اضغط **"Start a New Project"**
3. سجل دخول بحساب **GitHub**
4. اضغط **"New Project"** → **"Deploy from GitHub repo"**
5. اختر repository: **`asad200-stack/onlineweb`**
6. اضغط **"Deploy"**
7. انتظر (2-3 دقائق)

---

### 3️⃣ احصل على الرابط

1. بعد النشر، اضغط على المشروع
2. اضغط على الخدمة (Service)
3. في قسم **"Networking"**، اضغط **"Generate Domain"**
4. انسخ الرابط (مثل: `https://onlineweb-production.up.railway.app`)

---

### 4️⃣ أضف Environment Variables

1. في صفحة المشروع، اضغط **"Variables"**
2. أضف:
   ```
   NODE_ENV=production
   JWT_SECRET=اكتب-نص-عشوائي-قوي-هنا
   ```
3. اضغط **"Add"**

---

### 5️⃣ إعداد رابط المتجر

1. افتح الرابط: `https://your-app.up.railway.app`
2. اذهب إلى: `/admin/login`
3. بيانات الدخول: `admin` / `admin123`
4. اذهب إلى **"الإعدادات"**
5. في **"رابط المتجر العام"**، أدخل: `https://your-app.up.railway.app`
6. احفظ

---

## 🎉 انتهى!

الآن:
- ✅ الرابط يعمل مع Backend
- ✅ قاعدة البيانات تعمل
- ✅ لوحة التحكم تعمل
- ✅ يمكنك مشاركة الرابط مع الزبائن

---

## 💡 لماذا Railway وليس GitHub Pages?

- ❌ GitHub Pages: Static فقط (HTML/CSS)
- ✅ Railway: Node.js + Backend + Database

**مشروعك يحتاج Backend → استخدم Railway!** 🚂

---

**بالتوفيق! 🚀**

