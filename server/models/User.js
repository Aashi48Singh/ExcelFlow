// const mongoose = require('mongoose');
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true, maxlength: 80 },
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String, required: true, select: false },
//   createdAt: { type: Date, default: Date.now },
// });
// module.exports = mongoose.model('User', userSchema);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

export default User;