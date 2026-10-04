// const router = require('express').Router();
// const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');
// const a = require('../controllers/authController');
// const f = require('../controllers/fileController');
// const x = require('../controllers/excelController');
// const au = require('../controllers/automationController');
// const r = require('../controllers/reportController');
// const h = require('../controllers/historyController');
// const templates = require('../services/templates');

// router.post('/auth/register', a.register);
// router.post('/auth/login', a.login);
// router.get('/auth/profile', auth, a.profile);

// router.use(auth); // everything below requires a valid token

// router.get('/stats', f.stats);
// router.post('/files/upload', upload, f.upload);
// router.get('/files', f.list);
// router.get('/files/:id', f.get);
// router.put('/files/:id/data', f.saveData);
// router.delete('/files/:id', f.remove);

// router.post('/automation', au.create);
// router.get('/automation', au.list);
// router.put('/automation/:id', au.update);
// router.delete('/automation/:id', au.remove);
// router.post('/automation/:id/duplicate', au.duplicate);
// router.post('/automation/:id/run', au.run);

// router.post('/excel/clean', x.clean);
// router.post('/excel/validate', x.validate);
// router.post('/excel/calculate', x.calculate);
// router.post('/excel/command', x.command);
// router.post('/excel/export', x.export);

// router.get('/templates', (_req, res) => res.json({ templates }));
// router.post('/reports/:fileId/generate', (req, res, next) => { req.query.type = req.body.type; next(); }, r.generate);
// router.get('/reports/:fileId/download', r.download);

// router.get('/history', h.list);
// router.get('/history/:id', h.get);
// router.get('/history/:id/download', h.download);

// // module.exports = router;
// export default router;
import express from "express";

import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

import * as a from "../controllers/authController.js";
import * as f from "../controllers/fileController.js";
import * as x from "../controllers/excelController.js";
import * as au from "../controllers/automationController.js";
import * as r from "../controllers/reportController.js";
import * as h from "../controllers/historyController.js";

import templates from "../services/templates.js";

const router = express.Router();

// =========================
// Authentication
// =========================

router.post("/auth/register", a.register);
router.post("/auth/login", a.login);
router.get("/auth/profile", auth, a.profile);

// =========================
// Protected Routes
// =========================

router.use(auth);

// =========================
// Files
// =========================

router.get("/stats", f.stats);

router.post(
  "/files/upload",
  upload,
  f.upload
);

router.get(
  "/files",
  f.list
);

router.get(
  "/files/:id",
  f.get
);

router.put(
  "/files/:id/data",
  f.saveData
);

router.delete(
  "/files/:id",
  f.remove
);

// =========================
// Automation
// =========================

router.post(
  "/automation",
  au.create
);

router.get(
  "/automation",
  au.list
);

router.put(
  "/automation/:id",
  au.update
);

router.delete(
  "/automation/:id",
  au.remove
);

router.post(
  "/automation/:id/duplicate",
  au.duplicate
);

router.post(
  "/automation/:id/run",
  au.run
);

// =========================
// Excel
// =========================

router.post(
  "/excel/clean",
  x.clean
);

router.post(
  "/excel/validate",
  x.validate
);

router.post(
  "/excel/calculate",
  x.calculate
);

router.post(
  "/excel/command",
  x.command
);

// IMPORTANT:
// excelController.js exports `exportFile`,
// not `export`.
router.post(
  "/excel/export",
  x.exportFile
);

router.get(
  "/excel/supported",
  x.supported
);

// =========================
// Templates
// =========================

router.get(
  "/templates",
  (_req, res) => {
    res.json({
      templates,
    });
  }
);

// =========================
// Reports
// =========================

router.post(
  "/reports/:fileId/generate",
  (req, res, next) => {
    req.query.type = req.body.type;
    next();
  },
  r.generate
);

router.get(
  "/reports/:fileId/download",
  r.download
);

// =========================
// History
// =========================

router.get(
  "/history",
  h.list
);

router.get(
  "/history/:id",
  h.get
);

router.get(
  "/history/:id/download",
  h.download
);

export default router;