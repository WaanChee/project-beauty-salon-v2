# 🌸 Beauty Salon Frontend

Frontend application for the Beauty Salon Booking System - Built with React, Vite, Redux Toolkit, and Firebase.

---

## 🚀 Deployment to Vercel

### **Step 1: Prepare Your Frontend Repository**

1. **Create a new GitHub repository** called `beauty-salon-frontend`
2. **Add all frontend files** (exclude `backend-index.js`)
3. **Commit and push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial frontend setup"
   git branch -M main
   git remote add origin https://github.com/your-username/beauty-salon-frontend.git
   git push -u origin main
   ```

---

### **Step 2: Deploy to Vercel**

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"New Project"**
3. **Import your repository:** `beauty-salon-frontend`
4. **Framework Preset:** Vite (auto-detected)
5. **Root Directory:** `./` (keep default)
6. Click **"Deploy"**

---

### **Step 3: Set Environment Variables in Vercel**

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add each variable:

#### **Backend API URL**

```
Key: VITE_API_URL
Value: https://your-backend-service.onrender.com
```

_Use your Render backend URL from Step 1_

#### **Firebase Configuration**

Get these from Firebase Console → Project Settings → Your apps:

```
Key: VITE_API_KEY
Value: AIzaSy...your-api-key

Key: VITE_AUTH_DOMAIN
Value: your-project.firebaseapp.com

Key: VITE_PROJECT_ID
Value: your-project-id

Key: VITE_STORAGE_BUCKET
Value: your-project.appspot.com

Key: VITE_MESSAGING_SENDER_ID
Value: 123456789012

Key: VITE_APP_ID
Value: 1:123456789012:web:abcdef123456
```

3. **Save** and **Redeploy** (Vercel will prompt you)

---

### **Step 4: Update Backend CORS**

Go back to your **Render backend**:

1. Open your Render service dashboard
2. Add or update `FRONTEND_URL` in Environment Variables:
   ```
   Key: FRONTEND_URL
   Value: https://your-app.vercel.app
   ```
3. If you use multiple frontend domains, separate them with commas.
4. Redeploy the backend service to apply the changes.

---

### **Step 5: Test Your Deployed App**

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Test authentication (login/register)
3. Test booking creation
4. Test admin features

---

## 🔄 Auto-Deploy from GitHub

Vercel automatically redeploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```
3. Vercel will automatically:
   - Build your app (`npm run build`)
   - Deploy to production
   - Update your live site in ~30 seconds

---

## 🛠️ Local Development

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/beauty-salon-frontend.git
   cd beauty-salon-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create `.env` file:**

   ```bash
   cp .env.template .env
   ```

4. **Update `.env` with your values:**

   ```env
   VITE_API_URL=http://localhost:3000
   VITE_API_KEY=your-firebase-api-key
   VITE_AUTH_DOMAIN=your-project.firebaseapp.com
   # ... etc
   ```

5. **Run development server:**

   ```bash
   npm run dev
   ```

6. **Open:** `http://localhost:5173`

---

## 📦 Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 7
- **State Management:** Redux Toolkit
- **Routing:** React Router v7
- **UI:** React Bootstrap + Bootstrap Icons
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **Maps:** Google Maps API
- **HTTP Client:** Axios

---

## 🔐 Environment Variables

### **Development (.env)**

```env
VITE_API_URL=http://localhost:3000
VITE_API_KEY=your-firebase-api-key
VITE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_PROJECT_ID=your-project-id
VITE_STORAGE_BUCKET=your-project.appspot.com
VITE_MESSAGING_SENDER_ID=123456789012
VITE_APP_ID=1:123456789012:web:abcdef123456
```

### **Production (Vercel)**

Same variables, but `VITE_API_URL` points to Replit:

```
VITE_API_URL=https://your-repl-name.replit.dev
```

---

## 🐛 Troubleshooting

### **API calls failing (CORS errors)**

- Check if `VITE_API_URL` in Vercel matches your Replit URL
- Verify backend `FRONTEND_URL` secret includes your Vercel domain
- Check browser console for specific error messages

### **Firebase errors**

- Verify all Firebase environment variables are set correctly
- Check Firebase Console → Authentication is enabled
- Check Firebase Console → Storage rules allow your domain

### **Build fails on Vercel**

- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify no import errors or TypeScript issues

### **Environment variables not working**

- Remember to add `VITE_` prefix to all env vars
- Redeploy after adding new environment variables
- Clear browser cache if values seem outdated

---

## 📂 Project Structure

```
src/
├── assets/          # Images, icons
├── components/      # Reusable components
├── config/          # Firebase, API config
├── features/        # Redux slices
├── hooks/           # Custom React hooks
├── pages/           # Route pages
├── App.jsx          # Main app component
├── main.jsx         # Entry point
└── store.js         # Redux store
```

---

## 🎨 Key Features

- 👤 Customer & Admin authentication
- 📅 Booking management system
- 🖼️ Gallery with Firebase Storage
- 🗺️ Google Maps integration
- 📱 Responsive design (Bootstrap)
- 🔒 Protected routes with auth guards
- ⚡ Fast build times with Vite

---

## 🔗 Related Repositories

- **Backend:** [beauty-salon-backend](https://github.com/your-username/beauty-salon-backend)

---

## 🎉 Deployment Checklist

- ✅ Frontend deployed to Vercel
- ✅ Backend deployed to Replit
- ✅ All environment variables set
- ✅ CORS configured correctly
- ✅ Firebase Authentication enabled
- ✅ Firebase Storage configured
- ✅ Database (Neon) connected
- ✅ Custom domain (optional)

---

**Made with ❤️ for Beauty Salon Management**
