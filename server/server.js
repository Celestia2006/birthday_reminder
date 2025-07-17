require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fix 1: Remove duplicate CloudinaryStorage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "birthday-reminder",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) =>
      `birthday-${Date.now()}-${req.userId || "unknown"}`,
  },
});

const upload = multer({
  storage: storage, // Fix 2: Use the single storage instance
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Middleware setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "user-id"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
}
testConnection();

// Authentication middleware
const checkLoggedIn = (req, res, next) => {
  const userId = req.headers["user-id"];
  console.log(`[DEBUG] Authentication check - user-id header: ${userId}`);

  if (!userId) {
    console.log("[DEBUG] No user-id header found - rejecting request");
    return res.status(401).json({
      success: false,
      error: "Not logged in",
    });
  }

  req.userId = userId;
  next();
};

// Fix 3: Improved Cloudinary test endpoint
app.get("/api/cloudinary-test", async (req, res) => {
  try {
    // Using a valid test image URL
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { folder: "birthday-reminder-test" }
    );
    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary test error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Fix 4: Phone number processing in POST/PUT endpoints
const processPhoneNumber = (phone) => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length !== 10) {
    throw new Error("Phone number must be 10 digits");
  }
  return digits;
};

// Birthdays endpoints with fixes
app.post(
  "/api/birthdays",
  checkLoggedIn,
  upload.single("photo"),
  async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.name || !req.body.birth_date || !req.body.phone_number) {
        return res.status(400).json({
          success: false,
          error: "Name, birth date, and phone number are required",
        });
      }

      // Process phone number
      const phoneDigits = processPhoneNumber(req.body.phone_number);

      // Process photo upload
      let photoUrl = null;
      if (req.file) {
        console.log("Uploading file to Cloudinary...");
        // Fix 5: Proper Cloudinary upload handling
        const result = await cloudinary.uploader.upload(req.file.path);
        photoUrl = result.secure_url;
        // Clean up the temporary file
        fs.unlinkSync(req.file.path);
      }

      // Insert into database
      const {
        rows: [newBirthday],
      } = await pool.query(
        `INSERT INTO birthdays (
          name, nickname, phone_number, birth_date,
          relationship, zodiac, photo_url,
          personalized_message, favorite_color,
          hobbies, gift_ideas, notes, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          req.body.name.substring(0, 100),
          req.body.nickname?.substring(0, 100) || null,
          phoneDigits,
          req.body.birth_date,
          req.body.relationship?.substring(0, 50) || "Friend",
          req.body.zodiac?.substring(0, 20) || null,
          photoUrl,
          req.body.personalized_message || null,
          req.body.favorite_color?.substring(0, 50) || null,
          req.body.hobbies || null,
          req.body.gift_ideas || null,
          req.body.notes || null,
          req.userId,
        ]
      );

      res.status(201).json({
        success: true,
        data: newBirthday,
      });
    } catch (err) {
      console.error("Error creating birthday:", err);

      // Clean up if there was a file upload
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupErr) {
          console.error("Error cleaning up file:", cleanupErr);
        }
      }

      res.status(500).json({
        success: false,
        error: err.message.includes("Phone number")
          ? err.message
          : "Failed to create birthday record",
      });
    }
  }
);

// Fix 6: Remove duplicate server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔍 Test Cloudinary config: /api/cloudinary-test`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Server error",
    message: err.message,
  });
});
