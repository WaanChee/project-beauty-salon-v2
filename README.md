<div align="center">

# 💇‍♀️ Beauty Salon Booking System

**A modern, full-stack web application for managing beauty salon services, bookings, and customer relationships.**

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)](https://neon.tech/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Storage-FFCA28?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-ISC-blue)](LICENSE)

[Documentation](#documentation) • [Report Bug](../../issues) • [Request Feature](../../issues)

</div>

---

## ✨ Key Features

- 🔐 **Secure Authentication** — JWT + Firebase Auth with role-based access
- 📅 **Smart Booking System** — Real-time booking management with conflict prevention
- 🎨 **Gallery Management** — Upload and showcase services with Firebase Storage
- 📍 **Google Maps Integration** — Display salon location interactively
- 📱 **Responsive Design** — Works seamlessly on mobile, tablet, and desktop
- 🛡️ **Enterprise Security** — Rate limiting, CORS, helmet.js, SSL encryption
- ⚡ **Fast & Modern** — Built with React 19, Vite, and Redux Toolkit
- 🗄️ **Scalable Database** — PostgreSQL on Neon with automatic schema generation

---

## 📁 Project Structure

```
project-beauty-salon-v2/
├── backend/                     # Express API Server
│   ├── index.js                 # Main server file
│   ├── package.json             # Dependencies
│   ├── .env.template            # Environment variables
│   └── README.md                # Backend guide
│
├── frontend/                     # React Application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route pages
│   │   ├── features/            # Redux state slices
│   │   ├── hooks/               # Custom React hooks
│   │   ├── config/              # Firebase & API config
│   │   └── assets/              # Images & icons
│   ├── package.json             # Dependencies
│   ├── vite.config.js          # Build config
│   └── README.md                # Frontend guide
│
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** or yarn
- **[Neon PostgreSQL Account](https://neon.tech/)** (free tier)
- **[Firebase Project](https://firebase.google.com/)**

### Local Development in 3 Steps

**1️⃣ Backend Setup** (Terminal 1)

```bash
cd backend
cp .env.template .env
# Edit .env with your DATABASE_URL and SECRET_KEY
npm install && npm start
```

**2️⃣ Frontend Setup** (Terminal 2)

```bash
cd frontend
cp .env.template .env
# Edit .env with your Firebase credentials
npm install && npm run dev
```

**3️⃣ Open Your Browser**

```
Visit http://localhost:5173 ✨
```

---

## 📚 Detailed Setup Guide

### Backend Configuration

**Get your Neon PostgreSQL Connection String:**

1. Go to [neon.tech](https://neon.tech)
2. Create a free account and new project
3. Copy your connection string

**Configure `.env` file:**

```env
DATABASE_URL=postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
SECRET_KEY=your-super-secret-key-minimum-32-characters-long
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Start the server:**

```bash
npm start
```

✅ Backend runs at `http://localhost:3000`

- Database tables auto-created on first startup
- All routes documented at server URL

### Frontend Configuration

**Get your Firebase Credentials:**

1. Visit [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Add a web app to your project
4. Copy the configuration values

**Configure `.env` file:**

```env
VITE_API_URL=http://localhost:3000
VITE_API_KEY=AIzaSy...
VITE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_PROJECT_ID=your-project-id
VITE_STORAGE_BUCKET=your-project.appspot.com
VITE_MESSAGING_SENDER_ID=123456789012
VITE_APP_ID=1:123456789012:web:abcdefg
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

**Start development server:**

```bash
npm run dev
```

✅ Frontend runs at `http://localhost:5173`

---

## 🧪 Testing the Application

### Create Admin Account

1. Navigate to `http://localhost:5173/login/admin`
2. Click "Create Admin Account"
3. Fill in your details and sign up

### Admin Dashboard

- Login with your admin credentials
- Manage all bookings and services

### Customer Portal

1. Go to `http://localhost:5173/customer/auth`
2. Create a customer account
3. Browse services and book appointments

---

## 🏗️ Tech Stack

| Layer              | Technology      | Purpose            |
| ------------------ | --------------- | ------------------ |
| **Frontend**       | React 19        | UI Framework       |
|                    | Vite            | Fast bundler       |
|                    | Redux Toolkit   | State management   |
|                    | React Router v7 | Navigation         |
|                    | Bootstrap       | Styling            |
|                    | Firebase Auth   | Authentication     |
| **Backend**        | Express.js      | REST API           |
|                    | PostgreSQL      | Database           |
|                    | Firebase Admin  | File storage       |
|                    | JWT             | Secure tokens      |
| **Infrastructure** | Neon            | Managed PostgreSQL |
|                    | Firebase        | Auth & Storage     |
|                    | Helmet.js       | Security headers   |
|                    | Rate Limiter    | API protection     |

---

## 🚢 Deployment Guide

### Deploy Backend to Replit

1. Create [Replit](https://replit.com) account
2. Fork this repository to Replit
3. Add secrets in Replit console:
   - `DATABASE_URL` → Your Neon connection string
   - `SECRET_KEY` → Your JWT secret key
   - `FIREBASE_SERVICE_ACCOUNT` → Firebase admin credentials
   - `FRONTEND_URL` → Your Vercel URL (after deploying frontend)

4. Backend automatically deployed! 🎯

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add environment variables (from `.env` file)
4. Deploy automatically on every push! ✨

[Full Deployment Checklist](DEPLOYMENT-CHECKLIST.md)

---

## 🔐 Security Features

✅ **JWT Authentication** – Secure token-based auth  
✅ **Firebase Auth** – Industry-standard authentication  
✅ **Password Hashing** – bcryptjs for secure storage  
✅ **Database Encryption** – PostgreSQL with SSL/TLS  
✅ **Rate Limiting** – Protect API from abuse  
✅ **CORS Protection** – Whitelist trusted domains  
✅ **Security Headers** – Helmet.js configuration  
✅ **Environment Variables** – Secrets never in code

---

## 📖 Documentation

- **[Backend README](backend/README.md)** — API setup and endpoints
- **[Frontend README](frontend/README.md)** — React app setup and features
- **[Deployment Checklist](DEPLOYMENT-CHECKLIST.md)** — Production deployment steps
- **[Organization Guide](ORGANIZATION-GUIDE.md)** — Project structure details

---

## ⚠️ Important Notes

- 🔒 **Never commit `.env` files** — Already in `.gitignore`
- 🔑 **Keep credentials private** — Don't share API keys
- 🗄️ **Auto-generated schema** — Database tables created on first run
- 📱 **Frontend needs backend** — Make sure backend runs before frontend

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

Have questions? Check the detailed guides:

- Backend issues? → See [Backend README](backend/README.md)
- Frontend issues? → See [Frontend README](frontend/README.md)
- Deployment stuck? → See [Deployment Checklist](DEPLOYMENT-CHECKLIST.md)

---

## 📄 License

This project is licensed under the ISC License — see LICENSE file for details.

---

<div align="center">

**Made with ❤️ for Beauty Salon Management**

[Report a Bug](../../issues) • [Request a Feature](../../issues) • [View Documentation](#documentation)

</div>
