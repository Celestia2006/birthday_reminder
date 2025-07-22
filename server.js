require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.static(path.join(__dirname, "../client/build")));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../client/public/images/upload");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Wangxian&777",
  database: process.env.DB_NAME || "birthday_reminder",
  waitForConnections: true,
  connectionLimit: 10,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to the database");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}
testConnection();

const checkLoggedIn = (req, res, next) => {
  console.log("Incoming request headers:", req.headers); 
  const userId = req.headers["user-id"];

  if (!userId) {
    console.log("No user-id header found"); 
    return res.status(401).json({
      success: false,
      error: "Not logged in",
    });
  }

  req.userId = userId;
  next();
};

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", username, password);

    const [users] = await pool.query(
      "SELECT id, username FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (users.length === 0) {
      console.log("No matching user found");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.json({
      success: true,
      userId: users[0].id,
      username: users[0].username,
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

    const [existing] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Username or email already exists",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, password, email]
    );

    res.status(201).json({
      success: true,
      userId: result.insertId,
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

app.get("/api/birthdays", checkLoggedIn, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT *, YEAR(CURDATE()) - YEAR(birth_date) AS age FROM birthdays WHERE user_id = ?",
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
    console.log("File upload received:", req.file); 
    console.log("Request body:", req.body); 

    try {
      if (!req.body.name || !req.body.birth_date) {
        if (req.file) {
          console.log("Deleting invalid file:", req.file.path);
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          message: "Name and birth date are required",
        });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(req.body.birth_date)) {
        if (req.file) {
          console.log(
            "Deleting file due to invalid date format:",
            req.file.path
          );
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          error: "Invalid date format",
          message: "Birth date must be in YYYY-MM-DD format",
        });
      }

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        console.log("Starting database transaction");

        const [result] = await connection.query("INSERT INTO birthdays SET ?", [
          {
            name: req.body.name.substring(0, 100),
            nickname: req.body.nickname?.substring(0, 100) || null,
            birth_date: req.body.birth_date,
            relationship: req.body.relationship?.substring(0, 50) || "Friend",
            zodiac: req.body.zodiac?.substring(0, 20) || null,
            personalized_message: req.body.personalized_message || null,
            favorite_color: req.body.favorite_color?.substring(0, 50) || null,
            hobbies: req.body.hobbies || null,
            gift_ideas: req.body.gift_ideas || null,
            notes: req.body.notes || null,
            user_id: req.userId,
          },
        ]);

        const newId = result.insertId;
        console.log("New record created with ID:", newId); 

        let photoUrl = null;
        if (req.file) {
          console.log("Processing file upload for ID:", newId); 

          const fileExt = path.extname(req.file.originalname).toLowerCase();
          const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];

          if (!allowedExtensions.includes(fileExt)) {
            throw new Error(
              "Invalid file type. Only JPG, PNG, or GIF are allowed."
            );
          }

          const newFilename = `${newId}${fileExt}`;
          const oldPath = req.file.path;
          const uploadDir = path.join(
            __dirname,
            "../client/public/images/upload"
          );
          const newPath = path.join(uploadDir, newFilename);

          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          console.log(`Renaming ${oldPath} to ${newPath}`); 
          fs.renameSync(oldPath, newPath);
          photoUrl = `/images/upload/${newFilename}`;

          console.log("Updating record with photo URL:", photoUrl); 
          await connection.query(
            "UPDATE birthdays SET photo_url = ? WHERE id = ?",
            [photoUrl, newId]
          );
        }

        const [rows] = await connection.query(
          "SELECT * FROM birthdays WHERE id = ?",
          [newId]
        );

        await connection.commit();
        console.log("Transaction committed successfully"); 

        res.status(201).json({
          success: true,
          data: rows[0],
        });
      } catch (err) {
        console.error("Transaction error:", err); 
        await connection.rollback();
        if (req.file) {
          console.log("Rollback - deleting file:", req.file.path);
          fs.unlinkSync(req.file.path);
        }
        throw err;
      } finally {
        connection.release();
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
      console.log("Edit request for ID:", id, "with file:", req.file);

      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        const [existing] = await connection.query(
          "SELECT * FROM birthdays WHERE id = ? AND user_id = ?",
          [id, req.userId]
        );

        if (existing.length === 0) {
          if (req.file) fs.unlinkSync(req.file.path);
          return res.status(404).json({
            success: false,
            error: "Birthday not found",
          });
        }

        let photoUrl = existing[0].photo_url;
        if (req.file) {
          if (photoUrl) {
            const oldPath = path.join(__dirname, "../client/public", photoUrl);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }

          const fileExt = path.extname(req.file.originalname).toLowerCase();
          const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];

          if (!allowedExtensions.includes(fileExt)) {
            throw new Error("Invalid file type. Only images are allowed.");
          }

          const newFilename = `${id}${fileExt}`;
          const oldPath = req.file.path;
          const uploadDir = path.join(
            __dirname,
            "../client/public/images/upload"
          );
          const newPath = path.join(uploadDir, newFilename);

          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          fs.renameSync(oldPath, newPath);
          photoUrl = `/images/upload/${newFilename}`;
        }

        const updateData = {
          name: req.body.name || existing[0].name,
          nickname: req.body.nickname || existing[0].nickname,
          birth_date: req.body.birth_date || existing[0].birth_date,
          relationship: req.body.relationship || existing[0].relationship,
          zodiac: req.body.zodiac || existing[0].zodiac,
          personalized_message:
            req.body.personalized_message || existing[0].personalized_message,
          favorite_color: req.body.favorite_color || existing[0].favorite_color,
          hobbies: req.body.hobbies || existing[0].hobbies,
          gift_ideas: req.body.gift_ideas || existing[0].gift_ideas,
          notes: req.body.notes || existing[0].notes,
          photo_url: photoUrl,
        };

        await connection.query("UPDATE birthdays SET ? WHERE id = ?", [
          updateData,
          id,
        ]);

        const [rows] = await connection.query(
          "SELECT * FROM birthdays WHERE id = ?",
          [id]
        );

        await connection.commit();
        res.json({
          success: true,
          data: rows[0],
        });
      } catch (err) {
        await connection.rollback();
        if (req.file) fs.unlinkSync(req.file.path);
        throw err;
      } finally {
        connection.release();
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

    const [existing] = await pool.query(
      "SELECT * FROM birthdays WHERE id = ? AND user_id = ?",
      [id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Birthday not found",
      });
    }

    if (existing[0].photo_url) {
      const photoPath = path.join(
        __dirname,
        "../client/public",
        existing[0].photo_url
      );
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await pool.query("DELETE FROM birthdays WHERE id = ?", [id]);
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /api/birthdays error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete birthday",
    });
  }
});

app.get("/api/user", checkLoggedIn, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, email FROM users WHERE id = ?",
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json(users[0]);
  } catch (err) {
    console.error("User profile error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user profile",
    });
  }
});

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
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/card/:id", checkLoggedIn, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM birthdays WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Card not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("GET /api/card error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch card",
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});
