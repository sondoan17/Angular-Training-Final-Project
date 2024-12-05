require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRouter = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const compression = require("compression");
const messageRoutes = require('./routes/messageRoutes');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:4200",
      "http://localhost:3000",
      "http://localhost:5173",
      "https://planify-app-pi.vercel.app",
      "https://accounts.google.com",
      "https://*.google.com",
      "https://www.planify.website",
      "https://planify.website",
      "https://planify-react-omega.vercel.app"
    ],
    credentials: true
  }
});
// Store io instance in app.locals instead of using app.get('io')
app.locals.io = io;
const distPath = path.join(__dirname, "browser");
// Middleware
app.use(express.json());
app.use(compression());
app.use(
  cors({
    origin: [
      'https://www.planify.website',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  })
);
// Logging middleware
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});
// Security headers
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:4200",
    "http://localhost:3000",
    'http://localhost:5173' ,
    "https://planify-app-pi.vercel.app",
    "https://accounts.google.com",
    "https://planify-app-backend.vercel.app",
    "https://www.planify.website",
    "https://planify-react-omega.vercel.app"
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.removeHeader("Cross-Origin-Embedder-Policy");

  // Update security headers
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  next();
});
// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/messages', messageRoutes);

// Serve static files from Angular app
app.use(express.static(distPath));

// Handle Angular app routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  socket.join(socket.userId);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});
// Handle preflight requests
app.options('*', cors({
  origin: [
    'https://www.planify.website',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
