# 🌸 Beauty Salon Backend API

Backend API for the Beauty Salon Booking System - Built with Node.js, Express, PostgreSQL (Neon), and Firebase Admin.

---

## 🚀 Deployment to Replit

### **Step 1: Prepare Your Backend Repository**

1. **Create a new GitHub repository** called `beauty-salon-backend`
2. **Add these files to the repo:**
   - `index.js` (rename from `backend-index.js`)
   - `package.json`
   - `.replit`
   - `.env.template` (copy to `.env` and fill in)
   - `.gitignore`
   - `README.md` (this file)

3. **Commit and push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial backend setup"
   git branch -M main
   git remote add origin https://github.com/your-username/beauty-salon-backend.git
   git push -u origin main
   ```

---

### **Step 2: Deploy to Replit**

1. **Go to [Replit](https://replit.com)** and sign in
2. Click **"Create Repl"** → **"Import from GitHub"**
3. **Paste your repository URL:** `https://github.com/your-username/beauty-salon-backend`
4. Click **"Import from GitHub"**

Replit will automatically:

- Detect Node.js project
- Install dependencies (`npm install`)
- Read the `.replit` file to know how to run the app

---

### **Step 3: Set Up Environment Variables (Secrets)**

In your Replit project:

1. Click the **"Secrets"** tab (🔒 lock icon in left sidebar)
2. Add each variable:

#### **DATABASE_URL** (Neon PostgreSQL)

```
Key: DATABASE_URL
Value: postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

_Get this from [Neon Console](https://console.neon.tech) → Your Project → Connection String_

#### **SECRET_KEY** (JWT Secret)

```
Key: SECRET_KEY
Value: (generate a random 32+ character string)
```

_Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in terminal_

#### **FIREBASE_SERVICE_ACCOUNT**

```
Key: FIREBASE_SERVICE_ACCOUNT
Value: {"type":"service_account","project_id":"...","private_key":"..."}
```

_Get from Firebase Console → Project Settings → Service Accounts → Generate New Private Key_  
**Important:** Copy the entire JSON as ONE LINE, no line breaks!

#### **FRONTEND_URL** (After deploying frontend to Vercel)

```
Key: FRONTEND_URL
Value: https://your-app.vercel.app
```

_Update this after deploying your frontend to Vercel_

---

### **Step 4: Run Your Backend**

1. Click the **"Run"** button at the top
2. Replit will execute: `npm start`
3. Your backend will be live at: `https://your-repl-name.replit.dev`

**Copy this URL!** You'll need it for the frontend deployment.

---

### **Step 5: Test Your Backend**

Open the Replit URL in a browser:

```
https://your-repl-name.replit.dev
```

You should see: `{"message": "Beauty Salon API is running"}` or similar.

Test an endpoint:

```
GET https://your-repl-name.replit.dev/bookings
```

---

## 🔄 Auto-Deploy from GitHub

Replit can automatically redeploy when you push to GitHub:

1. In Replit, go to **Version Control** tab
2. Click **"Connect to GitHub"**
3. Enable **"Auto-deploy from GitHub"**

Now every time you push to `main` branch, Replit will:

- Pull latest code
- Run `npm install`
- Restart the server

---

## 🗄️ Database Setup (Neon)

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to Replit Secrets as `DATABASE_URL`

Your backend will automatically:

- Connect to Neon PostgreSQL
- Create tables if they don't exist (if you have migration scripts)
- Handle all database operations

---

## 🔐 Security Checklist

- ✅ Never commit `.env` file
- ✅ Use Replit Secrets for all sensitive data
- ✅ CORS is configured to only allow your Vercel frontend
- ✅ Rate limiting is enabled on all endpoints
- ✅ Helmet.js adds security headers
- ✅ Firebase Admin SDK verifies tokens

---

## 📦 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon)
- **Authentication:** Firebase Admin SDK
- **Security:** Helmet, CORS, Rate Limiting
- **Deployment:** Replit

---

## 🐛 Troubleshooting

### **Backend won't start**

- Check Replit console for errors
- Verify all Secrets are set correctly
- Check if `DATABASE_URL` is valid (test in TablePlus or psql)

### **CORS errors**

- Make sure `FRONTEND_URL` in Secrets matches your Vercel URL exactly
- Check backend console for CORS blocked logs

### **Database connection failed**

- Verify Neon connection string includes `?sslmode=require`
- Check if Neon project is active (not paused)

### **Firebase Admin errors**

- Verify `FIREBASE_SERVICE_ACCOUNT` is valid JSON (one line)
- Check if service account has correct permissions in Firebase

---

## 📞 API Endpoints

See your `backend-index.js` for all available endpoints:

- `GET /bookings` - Get all bookings
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking
- `GET /customers/profile/:uid` - Get customer profile
- And more...

---

## 🎉 Next Steps

After deploying backend:

1. Copy your Replit URL
2. Deploy frontend to Vercel
3. Update frontend's `VITE_API_URL` environment variable
4. Update backend's `FRONTEND_URL` secret
5. Test the full application!

---

**Made with ❤️ for Beauty Salon Management**
