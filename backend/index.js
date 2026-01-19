// ============================================================================
// BEAUTY SALON BOOKING SYSTEM - SERVER
// Firebase Authentication + PostgreSQL Backend
// UPDATED: Fixed phone number persistence issue
// ============================================================================

// ============================================================================
// IMPORTS & CONFIGURATION
// ============================================================================
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
require("dotenv").config();

// Firebase Admin SDK
const admin = require("firebase-admin");

const app = express();
const PORT = process.env.PORT || 3000;
const { DATABASE_URL, SECRET_KEY } = process.env;

// Security middleware
app.set("trust proxy", 1); // 🔥 Trust first proxy (Replit)
app.use(helmet()); // Security headers

// ============================================================================
// FIREBASE ADMIN INITIALIZATION
// ============================================================================
try {
  // Option 1: Use service account from environment variable (RECOMMENDED for Replit)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized from environment variable");
  }
  // Option 2: Use service account file (if you uploaded it)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized from file");
  } else {
    console.warn(
      "⚠️ Firebase Admin not initialized - set FIREBASE_SERVICE_ACCOUNT env variable"
    );
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error.message);
  console.log("💡 Server will continue but Firebase features will be disabled");
}

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(helmet()); // Security headers

// CORS Configuration - Allow frontend from Vercel
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://your-app.vercel.app',
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternative local port
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ============================================================================
// RATE LIMITING
// ============================================================================

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  skipSuccessfulRequests: true,
  message: {
    error:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general limiter to all routes
app.use(generalLimiter);

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    require: false,
  },
});

// Test database connection
async function testDatabaseConnection() {
  const client = await pool.connect();
  try {
    const response = await client.query("SELECT version()");
    console.log("✅ Database connected successfully!");
    console.log(
      "📊 PostgreSQL version:",
      response.rows[0].version.split(" ")[0]
    );
  } catch (error) {
    console.error("❌ Database connection failed:", error.stack);
  } finally {
    client.release();
  }
}

testDatabaseConnection();

// Ensure bookings table has phone_snapshot to avoid overwriting historical phones
async function ensurePhoneSnapshotColumn() {
  const client = await pool.connect();
  try {
    await client.query(
      "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS phone_snapshot VARCHAR(50)"
    );
    console.log("✅ bookings.phone_snapshot column ensured");
  } catch (error) {
    console.error("❌ Failed to ensure phone_snapshot column:", error.message);
  } finally {
    client.release();
  }
}

ensurePhoneSnapshotColumn();

// ============================================================================
// SECURITY: PASSWORD VALIDATION HELPERS
// ============================================================================

const COMMON_PASSWORDS = [
  "password",
  "password123",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "letmein",
  "dragon",
  "baseball",
  "iloveyou",
  "trustno1",
  "1234567",
  "sunshine",
  "master",
  "123123",
  "welcome",
  "admin",
  "login",
  "passw0rd",
  "password1",
  "123456789",
  "beauty",
  "salon",
];

const isCommonPassword = (password) => {
  const lowerPassword = password.toLowerCase();
  return COMMON_PASSWORDS.some((common) =>
    lowerPassword.includes(common.toLowerCase())
  );
};

const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  if (password.length > 128) {
    errors.push("Password is too long (max 128 characters)");
  }

  if (isCommonPassword(password)) {
    errors.push("Password is too common. Please choose a stronger password.");
  }

  if (/^(.)\1+$/.test(password)) {
    errors.push("Password cannot be all the same character");
  }

  if (/^(012|123|234|345|456|567|678|789|890)+$/.test(password)) {
    errors.push("Password cannot be sequential numbers");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// MIDDLEWARE: VERIFY FIREBASE TOKEN
// ============================================================================
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ============================================================================
// ROOT ENDPOINT
// ============================================================================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🎉 Beauty Salon API - Firebase Edition",
    version: "3.0.1",
    status: "operational",
    authentication: "Firebase Authentication",
    endpoints: {
      auth: {
        "POST /customer/create-profile": "Create customer profile",
        "GET /customer/profile/:uid": "Get customer profile",
        "PUT /customer/profile/:uid": "Update customer profile",
        "POST /admin/create-profile": "Create admin profile",
        "GET /admin/verify/:uid": "Verify admin status",
      },
      bookings: {
        "GET /bookings": "Get all bookings (admin)",
        "GET /bookings/:id": "Get single booking",
        "POST /bookings": "Create new booking",
        "PUT /bookings/:id": "Update booking",
        "DELETE /bookings/:id": "Delete booking",
        "GET /customer/bookings/:userId": "Get customer's bookings",
        "PATCH /customer/bookings/:id/cancel": "Cancel booking",
      },
      users: {
        "GET /users": "Get all users with booking count",
        "GET /users/:id": "Get single user details",
      },
    },
  });
});

// ============================================================================
// FIREBASE - CUSTOMER PROFILE ENDPOINTS
// ============================================================================

// Create customer profile (after Firebase signup)
app.post("/customer/create-profile", authLimiter, async (req, res) => {
  const client = await pool.connect();

  try {
    const { uid, name, email, phone_number } = req.body;

    // Validation
    if (!uid || !name || !email || !phone_number) {
      return res.status(400).json({
        error: "Missing required fields: uid, name, email, phone_number",
      });
    }

    // Check if profile already exists
    const checkQuery = "SELECT * FROM users WHERE firebase_uid = $1";
    const existing = await client.query(checkQuery, [uid]);

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Profile already exists",
        profile: existing.rows[0],
      });
    }

    // Create profile
    const insertQuery = `
      INSERT INTO users (firebase_uid, name, email, phone_number)
      VALUES ($1, $2, $3, $4)
      RETURNING id, firebase_uid, name, email, phone_number, created_at
    `;

    const result = await client.query(insertQuery, [
      uid,
      name.trim(),
      email.toLowerCase().trim(),
      phone_number.trim(),
    ]);

    console.log(`✅ Customer profile created for uid: ${uid}`);

    res.status(201).json({
      message: "Customer profile created successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Create customer profile error:", error.message);
    res.status(500).json({
      error: "Failed to create customer profile",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

// Get customer profile by Firebase UID
app.get("/customer/profile/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const result = await pool.query(
      "SELECT id, firebase_uid, name, email, phone_number, created_at FROM users WHERE firebase_uid = $1",
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Customer profile not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get customer profile error:", error.message);
    res.status(500).json({
      error: "Failed to fetch customer profile",
      details: error.message,
    });
  }
});

// Update customer profile
app.put("/customer/profile/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, phone_number } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = $1, phone_number = $2
       WHERE firebase_uid = $3
       RETURNING id, firebase_uid, name, email, phone_number, created_at`,
      [name, phone_number, uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      message: "Profile updated successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ============================================================================
// FIREBASE - ADMIN PROFILE ENDPOINTS
// ============================================================================

// Create admin profile (after Firebase signup)
app.post("/admin/create-profile", authLimiter, async (req, res) => {
  const client = await pool.connect();

  try {
    const { uid, username, email } = req.body;

    // Validation
    if (!uid || !username || !email) {
      return res.status(400).json({
        error: "Missing required fields: uid, username, email",
      });
    }

    // Check if admin already exists
    const checkQuery = "SELECT * FROM admins WHERE firebase_uid = $1";
    const existing = await client.query(checkQuery, [uid]);

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Admin profile already exists",
        admin: existing.rows[0],
      });
    }

    // Check if username is taken
    const checkUsername = "SELECT * FROM admins WHERE username = $1";
    const existingUsername = await client.query(checkUsername, [username]);

    if (existingUsername.rows.length > 0) {
      return res.status(409).json({
        error: "Username already taken",
      });
    }

    // Create admin profile
    const insertQuery = `
      INSERT INTO admins (firebase_uid, username, email)
      VALUES ($1, $2, $3)
      RETURNING id, firebase_uid, username, email, created_at
    `;

    const result = await client.query(insertQuery, [
      uid,
      username.trim(),
      email.toLowerCase().trim(),
    ]);

    console.log(`✅ Admin profile created for uid: ${uid}`);

    res.status(201).json({
      message: "Admin profile created successfully",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Create admin profile error:", error.message);
    res.status(500).json({
      error: "Failed to create admin profile",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

// Verify admin status by Firebase UID
app.get("/admin/verify/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const result = await pool.query(
      "SELECT id, firebase_uid, username, email, created_at FROM admins WHERE firebase_uid = $1",
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        isAdmin: false,
        error: "Admin profile not found",
      });
    }

    res.json({
      isAdmin: true,
      username: result.rows[0].username,
      admin: result.rows[0],
    });
  } catch (error) {
    console.error("Verify admin error:", error.message);
    res.status(500).json({
      error: "Failed to verify admin status",
      details: error.message,
    });
  }
});

// ============================================================================
// BOOKINGS - ADMIN OPERATIONS
// ============================================================================

// Get ALL bookings (Admin view)
app.get("/bookings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id,
        b.title,
        b.description,
        b.date,
        b.time,
        b.status,
        b.user_id,
        b.created_at,
        u.name as user_name,
        u.email as user_email,
        COALESCE(b.phone_snapshot, u.phone_number) as user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch all bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get SINGLE booking by ID
app.get("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.description,
        b.date,
        b.time,
        b.status,
        b.user_id,
        b.created_at,
        u.name as user_name,
        u.email as user_email,
        COALESCE(b.phone_snapshot, u.phone_number) as user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch single booking error:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// CREATE new booking - FIXED: Updates phone number for existing users
app.post("/bookings", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      title,
      description,
      date,
      time,
      user_name,
      user_email,
      user_phone,
    } = req.body;

    // Validation
    if (!title || !date || !time || !user_name || !user_email || !user_phone) {
      return res.status(400).json({
        error: "Missing required fields",
        required: [
          "title",
          "date",
          "time",
          "user_name",
          "user_email",
          "user_phone",
        ],
      });
    }

    // Start transaction
    await client.query("BEGIN");

    // Check if user exists (by email)
    let userResult = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [user_email.toLowerCase().trim()]
    );

    let userId;

    if (userResult.rows.length > 0) {
      // User exists, use their ID but DON'T update phone (use snapshot instead)
      userId = userResult.rows[0].id;
      console.log(
        `✅ Using existing user ID ${userId}, phone stored in booking snapshot only`
      );
    } else {
      // User doesn't exist, create new user
      const newUserResult = await client.query(
        "INSERT INTO users (name, phone_number, email) VALUES ($1, $2, $3) RETURNING id",
        [user_name.trim(), user_phone.trim(), user_email.toLowerCase().trim()]
      );
      userId = newUserResult.rows[0].id;
      console.log(`✅ New user created with ID ${userId}`);
    }

    // Create booking
    const bookingResult = await client.query(
      "INSERT INTO bookings (title, description, date, time, user_id, phone_snapshot) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description || "", date, time, userId, user_phone.trim()]
    );

    // Get complete booking with user info
    const completeBooking = await client.query(
      `
      SELECT 
        b.id,
        b.title,
        b.description,
        b.date,
        b.time,
        b.status,
        b.user_id,
        b.created_at,
        u.name as user_name,
        u.email as user_email,
        COALESCE(b.phone_snapshot, u.phone_number) as user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `,
      [bookingResult.rows[0].id]
    );

    // Commit transaction
    await client.query("COMMIT");

    console.log(`✅ Booking created: ID ${completeBooking.rows[0].id}`);

    res.status(201).json(completeBooking.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create booking error:", error);
    res.status(500).json({ error: "Failed to create booking" });
  } finally {
    client.release();
  }
});

// UPDATE booking
app.put("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, status } = req.body;

    const result = await pool.query(
      "UPDATE bookings SET title = $1, description = $2, date = $3, time = $4, status = $5 WHERE id = $6 RETURNING *",
      [title, description, date, time, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Get complete booking with user info
    const completeBooking = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.description,
        b.date,
        b.time,
        b.status,
        b.user_id,
        b.created_at,
        u.name as user_name,
        u.email as user_email,
        COALESCE(b.phone_snapshot, u.phone_number) as user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `,
      [id]
    );

    res.json(completeBooking.rows[0]);
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// DELETE booking
app.delete("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM bookings WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({
      message: "Booking deleted successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// ============================================================================
// BOOKINGS - CUSTOMER OPERATIONS
// ============================================================================

// Get customer's OWN bookings by user_id (database ID)
app.get("/customer/bookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.description,
        b.date,
        b.time,
        b.status,
        b.user_id,
        b.created_at,
        u.name as user_name,
        u.email as user_email,
        COALESCE(b.phone_snapshot, u.phone_number) as user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch customer bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// CANCEL booking (Customer)
app.patch("/customer/bookings/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Verify booking belongs to user
    const checkResult = await pool.query(
      "SELECT * FROM bookings WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: "Booking not found or does not belong to this user",
      });
    }

    // Check if booking can be cancelled (not already completed or cancelled)
    if (
      checkResult.rows[0].status === "Completed" ||
      checkResult.rows[0].status === "Cancelled"
    ) {
      return res.status(400).json({
        error: `Cannot cancel booking with status: ${checkResult.rows[0].status}`,
      });
    }

    // Update booking status
    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      ["Cancelled", id]
    );

    // Get complete booking with user info
    const completeBooking = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.description,
        b.date,
        b.time,
        b.status,
        b.user_id,
        b.created_at,
        u.name as user_name,
        u.email as user_email,
        COALESCE(b.phone_snapshot, u.phone_number) as user_phone
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `,
      [id]
    );

    res.json({
      message: "Booking cancelled successfully",
      booking: completeBooking.rows[0],
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

// Get all users with booking count
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone_number,
        u.created_at,
        COUNT(b.id) as booking_count
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user details
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone_number,
        u.created_at,
        COUNT(b.id) as booking_count
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    hint: "Check the API documentation at GET /",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================
app.listen(PORT, () => {
  console.log("============================================");
  console.log("🚀 Beauty Salon API Server - Firebase Edition");
  console.log("============================================");
  console.log(`📍 Server running on port ${PORT}`);
  console.log(
    `🌐 API URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  );
  console.log(`📖 Documentation available at: GET /`);
  console.log(
    `🔥 Firebase Authentication: ${
      admin.apps.length > 0 ? "ENABLED" : "DISABLED"
    }`
  );
  console.log("============================================");
});
