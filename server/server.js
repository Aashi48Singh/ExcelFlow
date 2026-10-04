// // require('dotenv').config();
// // const express = require('express');
// // const cors = require('cors');
// // const helmet = require('helmet');
// // const rateLimit = require('express-rate-limit');
// // const connectDB = require('./config/db');
// // const routes = require('./routes');
// // const { notFound, errorHandler } = require('./middleware/errorHandler');

// // for (const key of ['MONGO_URI', 'JWT_SECRET']) {
// //   if (!process.env[key]) { console.error(`Missing required environment variable: ${key}`); process.exit(1); }
// // }

// // const app = express();
// // app.set('trust proxy', 1); // Render/Railway sit behind a proxy
// // const origins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());
// // app.use(helmet());
// // app.use(cors({ origin: origins, credentials: true }));
// // app.use(express.json({ limit: '10mb' }));
// // app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts. Please try again later.' } }));
// // app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// // app.get('/health', (_req, res) => res.json({ ok: true }));
// // app.use('/api', routes);
// // app.use(notFound);
// // app.use(errorHandler);

// // const port = process.env.PORT || 4000;
// // connectDB()
// //   .then(() => app.listen(port, () => console.log(`ExcelFlow API running on port ${port}`)))
// //   .catch((err) => { console.error('Failed to start server:', err.message); process.exit(1); });
// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";

// import connectDB from "./config/db.js";
// import routes from "./routes/index.js";
// import { notFound, errorHandler } from "./middleware/errorHandler.js";

// dotenv.config();

// for (const key of ["MONGO_URI", "JWT_SECRET"]) {
//   if (!process.env[key]) {
//     console.error(`Missing required environment variable: ${key}`);
//     process.exit(1);
//   }
// }

// const app = express();

// app.set("trust proxy", 1);

// const origins = (process.env.ALLOWED_ORIGIN || "http://localhost:5173")
//   .split(",")
//   .map((s) => s.trim());

// app.use(helmet());

// app.use(
//   cors({
//     origin: origins,
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "10mb" }));

// app.use(
//   "/api/auth",
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 50,
//     standardHeaders: true,
//     legacyHeaders: false,
//     message: {
//       message: "Too many attempts. Please try again later.",
//     },
//   })
// );

// app.use(
//   "/api",
//   rateLimit({
//     windowMs: 60 * 1000,
//     max: 300,
//     standardHeaders: true,
//     legacyHeaders: false,
//   })
// );

// app.get("/health", (_req, res) => {
//   res.json({
//     ok: true,
//   });
// });

// app.use("/api", routes);

// app.use(notFound);
// app.use(errorHandler);

// const port = process.env.PORT || 4000;

// connectDB()
//   .then(() => {
//     app.listen(port, () => {
//       console.log(`ExcelFlow API running on port ${port}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Failed to start server:", err.message);
//     process.exit(1);
//   })

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import {
  notFound,
  errorHandler,
} from "./middleware/errorHandler.js";

dotenv.config();

// Check required environment variables
for (const key of ["MONGO_URI", "JWT_SECRET"]) {
  if (!process.env[key]) {
    console.error(
      `Missing required environment variable: ${key}`
    );

    process.exit(1);
  }
}

const app = express();

app.set("trust proxy", 1);

// Allowed frontend origins
const origins = (
  process.env.ALLOWED_ORIGIN ||
  "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim());

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);

// JSON body parser
app.use(
  express.json({
    limit: "10mb",
  })
);

// Authentication rate limit
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: true,
    message: {
      message:
        "Too many attempts. Please try again later.",
    },
  })
);

// General API rate limit
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: true,
  })
);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Server port
const port = process.env.PORT || 4000;

// Connect MongoDB first, then start server
connectDB()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(
        `ExcelFlow API running on port ${port}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "Failed to start server:",
      err.message
    );

    process.exit(1);
  });