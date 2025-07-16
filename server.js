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
app.use(express.static(path.join(__dirname, "../client/build")));

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
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
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

// Auth Endpoints
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

// Protected API endpoints
app.get("/api/birthdays", checkLoggedIn, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT *, EXTRACT(YEAR FROM age(birth_date)) AS age 
       FROM birthdays WHERE user_id = $1`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/birthdays error:", err);
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
    try {
      // Validate required fields including phone_number
      if (!req.body.name || !req.body.birth_date || !req.body.phone_number) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          error: "Name, birth date, and phone number are required",
        });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const {
          rows: [newBirthday],
        } = await client.query(
          `INSERT INTO birthdays (
            name, nickname, birth_date, relationship, 
            zodiac, personalized_message, favorite_color,
            hobbies, gift_ideas, notes, user_id, phone_number
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *`,
          [
            req.body.name.substring(0, 100),
            req.body.nickname?.substring(0, 100) || null,
            req.body.birth_date,
            req.body.relationship?.substring(0, 50) || "Friend",
            req.body.zodiac?.substring(0, 20) || null,
            req.body.personalized_message || null,
            req.body.favorite_color?.substring(0, 50) || null,
            req.body.hobbies || null,
            req.body.gift_ideas || null,
            req.body.notes || null,
            req.userId,
            req.body.phone_number,
          ]
        );

        let photoUrl = null;
        if (req.file) {
          // File is automatically uploaded to Cloudinary by multer
          photoUrl = req.file.path; // Cloudinary returns URL in path

          await client.query(
            "UPDATE birthdays SET photo_url = $1 WHERE id = $2",
            [photoUrl, newBirthday.id]
          );
        }

        await client.query("COMMIT");
        res.status(201).json({
          success: true,
          data: newBirthday,
        });
      } catch (err) {
        await client.query("ROLLBACK");
        if (req.file) {
          // Delete from Cloudinary if upload failed
          try {
            await cloudinary.uploader.destroy(req.file.filename);
          } catch (e) {
            console.error("Error deleting failed upload:", e);
          }
        }
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({
        success: false,
        error: "Server error",
        message: err.message,
      });
    }
  }
);

app.put(
  "/api/birthdays/:id",
  checkLoggedIn,
  upload.single("photo"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // 1. Check if record exists
        const {
          rows: [existing],
        } = await client.query(
          "SELECT * FROM birthdays WHERE id = $1 AND user_id = $2",
          [id, req.userId]
        );

        if (!existing) {
          if (req.file) {
            try {
              await cloudinary.uploader.destroy(req.file.filename);
            } catch (e) {
              console.error("Error deleting failed upload:", e);
            }
          }
          return res.status(404).json({
            success: false,
            error: "Birthday not found",
          });
        }

        // 2. Handle photo update if new file uploaded
        let photoUrl = existing.photo_url;
        if (req.file) {
          // Delete old photo from Cloudinary if exists
          if (photoUrl) {
            try {
              const publicId = photoUrl.split("/").pop().split(".")[0];
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.error("Error deleting old image:", err);
            }
          }

          // New photo is automatically uploaded to Cloudinary
          photoUrl = req.file.path;
        }

        // 3. Update record
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
        await client.query("ROLLBACK");
        if (req.file) {
          try {
            await cloudinary.uploader.destroy(req.file.filename);
          } catch (e) {
            console.error("Error deleting failed upload:", e);
          }
        }
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error("PUT /api/birthdays error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to update birthday",
        message: err.message,
      });
    }
  }
);

app.delete("/api/birthdays/:id", checkLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Check if record exists and get photo info
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
          const publicId = existing.photo_url.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
        }
      }

      // 3. Delete record
      await client.query("DELETE FROM birthdays WHERE id = $1", [id]);
      await client.query("COMMIT");

      res.status(204).end();
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("DELETE /api/birthdays error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete birthday",
    });
  }
});

// Serve React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
