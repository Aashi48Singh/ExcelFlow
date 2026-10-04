// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const AppError = require('../utils/AppError');
// const asyncHandler = require('../utils/asyncHandler');

// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
// const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, createdAt: u.createdAt });

// exports.register = asyncHandler(async (req, res) => {
//   const name = String(req.body.name || '').trim();
//   const email = String(req.body.email || '').trim().toLowerCase();
//   const { password, confirmPassword } = req.body;
//   if (!name || !EMAIL_RE.test(email)) throw new AppError('Please enter your name and a valid email address.', 400);
//   if (typeof password !== 'string' || password.length < 8) throw new AppError('Password must be at least 8 characters long.', 400);
//   if (password !== confirmPassword) throw new AppError('Passwords do not match.', 400);
//   if (await User.findOne({ email })) throw new AppError('An account with this email already exists.', 409);
//   const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
//   res.status(201).json({ token: sign(user._id), user: publicUser(user) });
// });

// exports.login = asyncHandler(async (req, res) => {
//   const email = String(req.body.email || '').trim().toLowerCase();
//   const user = await User.findOne({ email }).select('+password');
//   const ok = user && typeof req.body.password === 'string' && (await bcrypt.compare(req.body.password, user.password));
//   if (!ok) throw new AppError('Invalid email or password.', 401);
//   res.json({ token: sign(user._id), user: publicUser(user) });
// });

// exports.profile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) throw new AppError('Please log in to continue.', 401);
//   res.json({ user: publicUser(user) });
// });
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const sign = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  createdAt: u.createdAt,
});

const register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();

  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  const { password, confirmPassword } = req.body;

  if (!name || !EMAIL_RE.test(email)) {
    throw new AppError(
      "Please enter your name and a valid email address.",
      400
    );
  }

  if (
    typeof password !== "string" ||
    password.length < 8
  ) {
    throw new AppError(
      "Password must be at least 8 characters long.",
      400
    );
  }

  if (password !== confirmPassword) {
    throw new AppError(
      "Passwords do not match.",
      400
    );
  }

  if (await User.findOne({ email })) {
    throw new AppError(
      "An account with this email already exists.",
      409
    );
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
  });

  res.status(201).json({
    token: sign(user._id),
    user: publicUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  const user = await User.findOne({ email })
    .select("+password");

  const ok =
    user &&
    typeof req.body.password === "string" &&
    (await bcrypt.compare(
      req.body.password,
      user.password
    ));

  if (!ok) {
    throw new AppError(
      "Invalid email or password.",
      401
    );
  }

  res.json({
    token: sign(user._id),
    user: publicUser(user),
  });
});

const profile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError(
      "Please log in to continue.",
      401
    );
  }

  res.json({
    user: publicUser(user),
  });
});

export {
  register,
  login,
  profile,
};