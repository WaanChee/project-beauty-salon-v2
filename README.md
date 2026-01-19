# Beauty Salon Booking System 🌸

Complete full-stack booking management system for beauty salons with authentication, bookings, and gallery management.

## 📂 Project Structure

This repository contains separate frontend and backend applications:

```
project-beauty-salon-v2/
├── backend/                 # Backend API (Replit)
│   ├── index.js            # Express server
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment variables template
│   ├── .replit             # Replit configuration
│   ├── README.md           # Backend deployment guide
│   └── .gitignore
│
├── frontend/               # React frontend (Vercel)
│   ├── src/               # React source code
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Route pages
│   │   ├── features/      # Redux slices
│   │   ├── hooks/         # Custom hooks
│   │   ├── config/        # Firebase & API config
│   │   └── assets/        # Images, icons
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── .env.example       # Environment variables template
│   ├── README.md          # Frontend deployment guide
│   └── .gitignore
│
└── README.md              # This file
```

## 🚀 Quick Start

### **Backend Deployment (Replit)**

1. Navigate to `backend/` folder
2. Follow instructions in `backend/README.md`
3. Deploy to Replit with Neon PostgreSQL

### **Frontend Deployment (Vercel)**

1. Navigate to `frontend/` folder
2. Follow instructions in `frontend/README.md`
3. Deploy to Vercel with Firebase

## 📦 Tech Stack

### **Backend**

- Node.js + Express
- PostgreSQL (Neon)
- Firebase Admin SDK
- JWT Authentication
- CORS & Security (Helmet, Rate Limiting)

### **Frontend**

- React 19 + Vite
- Redux Toolkit (State Management)
- React Router v7
- Firebase Auth & Storage
- React Bootstrap
- Google Maps API

## 🔗 Separate Repositories

When ready to deploy:

1. **Backend Repository**: `beauty-salon-backend`
   - Copy `backend/` folder contents
   - Push to GitHub
   - Deploy to Replit

2. **Frontend Repository**: `beauty-salon-frontend`
   - Copy `frontend/` folder contents
   - Push to GitHub
   - Deploy to Vercel

## ⚙️ Environment Variables

### **Backend** (Replit Secrets)

- `DATABASE_URL` - Neon PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `FIREBASE_SERVICE_ACCOUNT` - Firebase admin credentials
- `FRONTEND_URL` - Your Vercel frontend URL

### **Frontend** (Vercel Environment Variables)

- `VITE_API_URL` - Your Replit backend URL
- `VITE_API_KEY` - Firebase API key
- `VITE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_PROJECT_ID` - Firebase project ID
- `VITE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_APP_ID` - Firebase app ID

## 🎯 Features

✅ Customer & Admin authentication  
✅ Booking management system  
✅ Gallery with Firebase Storage  
✅ Google Maps integration  
✅ Responsive design (Bootstrap)  
✅ Protected routes with auth guards  
✅ Rate limiting & security headers

## 📚 Documentation

- **[Backend Deployment Guide](backend/README.md)** - Complete Replit setup instructions
- **[Frontend Deployment Guide](frontend/README.md)** - Complete Vercel setup instructions

## 🔐 Security

- ✅ JWT authentication
- ✅ Firebase Auth
- ✅ CORS configured for production domains
- ✅ Helmet.js security headers
- ✅ Rate limiting on API endpoints
- ✅ Environment variables for sensitive data
- ✅ PostgreSQL with SSL (Neon)

## 🎉 Deployment Checklist

- [ ] Backend deployed to Replit with Neon PostgreSQL
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured on both platforms
- [ ] CORS configured correctly
- [ ] Firebase project created and configured
- [ ] Custom domain (optional)
- [ ] SSL certificates (automatic on both platforms)

## 💡 Tips

1. **Development**: Run frontend locally with `npm run dev` (connects to local backend)
2. **Testing**: Use Postman or similar tool to test backend endpoints
3. **Database**: Use Neon Console to manage PostgreSQL database
4. **Firebase**: Use Firebase Console for auth and storage configuration

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

## 📞 Support

Refer to individual README files in `backend/` and `frontend/` directories for specific deployment help.

---

**Made with ❤️ for Beauty Salon Management**

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
