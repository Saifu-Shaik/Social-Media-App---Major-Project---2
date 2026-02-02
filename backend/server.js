const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
app.set("trust proxy", 1); // IMPORTANT for Render

const server = http.createServer(app);

/* ================= CORS ORIGINS ================= */

// After deploying frontend, you will add it in Render env as FRONTEND_URL
const allowedOrigins = [
  "http://localhost:3000", // local dev
  process.env.FRONTEND_URL, // Render / Netlify frontend
].filter(Boolean);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(userId.toString());
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    if (!receiverId || !text) return;

    io.to(receiverId.toString()).emit("receiveMessage", {
      sender: senderId,
      text,
      createdAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

app.set("io", io);

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FILES ================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= ROUTES ================= */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/2fa", require("./routes/twoFactorRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

/* ================= HEALTH CHECK (RENDER NEEDS THIS) ================= */

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.status(200).send("✅ Social Media API + Real-Time Chat Running...");
});

/* ================= DATABASE ================= */

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "socialmedia", // ✅ ensures correct database
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  });

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running with Socket.IO on port ${PORT}`);
});
