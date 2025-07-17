require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Initialize express app
const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure file storage with Cloudinary
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
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

function extractPublicId(url) {
  // Extract everything after /upload/ and before the file extension
  const matches = url.match(/\/upload\/(.+?)\.\w+$/);
  return matches ? matches[1] : null;
}

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "user-id"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React app
app.use(express.static(path.join(__dirname, "../client/build")));

// PostgreSQL connection pool
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

// Verify database connection
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

const checkLoggedIn = (req, res, next) => {
  const userId = req.headers["user-id"];

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Not logged in",
    });
  }

  req.userId = userId;
  next();
};

// Auth Endpoints (unchanged from your original)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { rows } = await pool.query(
      "SELECT id, username FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.json({
      success: true,
      userId: rows[0].id,
      username: rows[0].username,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const { rows: existing } = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Username or email already exists",
      });
    }

    const {
      rows: [user],
    } = await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id",
      [username, password, email]
    );

    res.status(201).json({
      success: true,
      userId: user.id,
      username,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// Protected API endpoints with Cloudinary integration
app.get("/api/birthdays", checkLoggedIn, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT *, EXTRACT(YEAR FROM age(birth_date)) AS age 
       FROM birthdays WHERE user_id = $1`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch birthdays:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch birthdays",
    });
  }
});

app.post(
  "/api/birthdays",
  checkLoggedIn,
  upload.single("photo"),
  async (req, res) => {
    let client;
    try {
      // Validate required fields
      if (!req.body.name || !req.body.birth_date || !req.body.phone_number) {
        return res.status(400).json({
          success: false,
          error: "Name, birth date, and phone number are required",
        });
      }

      // Process phone number
      const phoneDigits = String(req.body.phone_number).replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        return res.status(400).json({
          success: false,
          error: "Phone number must be 10 digits",
        });
      }

      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.birth_date)) {
        return res.status(400).json({
          success: false,
          error: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      client = await pool.connect();
      await client.query("BEGIN");

      // Process Cloudinary upload if photo exists
      let photoUrl = null;
      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "birthday-reminder",
            resource_type: "auto",
            quality: "auto:good",
            width: 800,
            crop: "limit",
          });
          photoUrl = result.secure_url;
        } catch (uploadErr) {
          console.error("Cloudinary upload error:", uploadErr);
          throw new Error("Failed to process image upload");
        } finally {
          // Clean up temp file if it exists
          if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      }

      // Insert into database
      const {
        rows: [newBirthday],
      } = await client.query(
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

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        data: newBirthday,
      });
    } catch (err) {
      if (client) await client.query("ROLLBACK");
      console.error("Error creating birthday:", err);

      res.status(500).json({
        success: false,
        error:
          err.message.includes("Phone number") ||
          err.message.includes("date") ||
          err.message.includes("image")
            ? err.message
            : "Failed to create birthday record",
      });
    } finally {
      if (client) client.release();
    }
  }
);

app.put(
  "/api/birthdays/:id",
  checkLoggedIn,
  upload.single("photo"),
  async (req, res) => {
    let client;
    try {
      const { id } = req.params;
      client = await pool.connect();
      await client.query("BEGIN");

      // Check if record exists
      const {
        rows: [existing],
      } = await client.query(
        "SELECT * FROM birthdays WHERE id = $1 AND user_id = $2",
        [id, req.userId]
      );

      if (!existing) {
        // No need to delete file here - Multer hasn't processed it yet
        return res.status(404).json({
          success: false,
          error: "Birthday not found",
        });
      }

      // Handle photo update if new file uploaded
      let photoUrl = existing.photo_url;
      if (req.file) {
        try {
          // Delete old photo from Cloudinary if exists
          if (existing.photo_url) {
            const publicId = existing.photo_url
              .split("/upload/")[1]
              .split(".")[0];
            await cloudinary.uploader.destroy(publicId);
          }

          // Upload new photo to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "birthday-reminder",
            resource_type: "auto",
          });
          photoUrl = result.secure_url;
        } catch (cloudinaryErr) {
          console.error("Cloudinary error:", cloudinaryErr);
          throw new Error("Failed to process image upload");
        } finally {
          // Clean up the temporary file if it exists
          if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      }

      // Update record
      const {
        rows: [updated],
      } = await client.query(
        `UPDATE birthdays SET
          name = COALESCE($1, name),
          nickname = COALESCE($2, nickname),
          birth_date = COALESCE($3, birth_date),
          relationship = COALESCE($4, relationship),
          zodiac = COALESCE($5, zodiac),
          personalized_message = COALESCE($6, personalized_message),
          favorite_color = COALESCE($7, favorite_color),
          hobbies = COALESCE($8, hobbies),
          gift_ideas = COALESCE($9, gift_ideas),
          notes = COALESCE($10, notes),
          photo_url = COALESCE($11, photo_url),
          phone_number = COALESCE($12, phone_number)
        WHERE id = $13
        RETURNING *`,
        [
          req.body.name || null,
          req.body.nickname || null,
          req.body.birth_date || null,
          req.body.relationship || null,
          req.body.zodiac || null,
          req.body.personalized_message || null,
          req.body.favorite_color || null,
          req.body.hobbies || null,
          req.body.gift_ideas || null,
          req.body.notes || null,
          photoUrl || null,
          req.body.phone_number || existing.phone_number,
          id,
        ]
      );

      await client.query("COMMIT");
      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      if (client) await client.query("ROLLBACK");
      console.error("Error updating birthday:", err);

      // Clean up temporary file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: "Failed to update birthday",
        message: err.message,
      });
    } finally {
      if (client) client.release();
    }
  }
);

app.delete("/api/birthdays/:id", checkLoggedIn, async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    client = await pool.connect();
    await client.query("BEGIN");

    // 1. Get the existing record
    const {
      rows: [existing],
    } = await client.query(
      "SELECT photo_url FROM birthdays WHERE id = $1 AND user_id = $2",
      [id, req.userId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Birthday not found",
      });
    }

    // 2. Delete photo from Cloudinary if exists
    if (existing.photo_url) {
      try {
        // Extract public ID correctly from Cloudinary URL
        const urlParts = existing.photo_url.split("/upload/");
        if (urlParts.length > 1) {
          const publicIdWithExtension = urlParts[1];
          const publicId = publicIdWithExtension.split(".")[0]; // Remove file extension

          await cloudinary.uploader.destroy(publicId, {
            invalidate: true, // Optional: purge from CDN cache
          });
          console.log(`Deleted Cloudinary image: ${publicId}`);
        }
      } catch (cloudinaryErr) {
        console.error("Cloudinary deletion error:", cloudinaryErr);
        // Continue with deletion even if image deletion fails
      }
    }

    // 3. Delete database record
    await client.query("DELETE FROM birthdays WHERE id = $1", [id]);
    await client.query("COMMIT");

    res.status(204).end();
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("Error deleting birthday:", err);

    // Determine appropriate error message
    const errorMessage =
      err.code === "23503"
        ? "Cannot delete - referenced by other records"
        : "Failed to delete birthday";

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  } finally {
    if (client) client.release();
  }
});

// Handle React routing - return all requests to React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔍 Test endpoint: /api/debug-test`);
});
