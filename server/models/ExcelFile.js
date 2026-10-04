// // const mongoose = require('mongoose');
// // const schema = new mongoose.Schema({
// //   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
// //   fileName: { type: String, required: true },
// //   fileType: { type: String, required: true },
// //   rowCount: { type: Number, default: 0 },
// //   columnCount: { type: Number, default: 0 },
// //   sheets: [String],
// //   status: { type: String, enum: ['Uploaded', 'Processing', 'Completed', 'Failed'], default: 'Uploaded' },
// //   columns: [String],
// //   // Parsed rows live in MongoDB so the backend stays stateless (works on Render/Railway).
// //   // A single document is limited to 16 MB; uploads are capped well below that.
// //   data: { type: mongoose.Schema.Types.Mixed, select: false, default: [] },
// //   createdAt: { type: Date, default: Date.now },
// // });
// // module.exports = mongoose.model('ExcelFile', schema);

// import mongoose from "mongoose";

// const schema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     fileName: {
//       type: String,
//       required: true,
//     },

//     fileType: {
//       type: String,
//       required: true,
//     },

//     rowCount: {
//       type: Number,
//       default: 0,
//     },

//     columnCount: {
//       type: Number,
//       default: 0,
//     },

//     sheets: [String],

//     status: {
//       type: String,
//       enum: [
//         "Uploaded",
//         "Processing",
//         "Completed",
//         "Failed",
//       ],
//       default: "Uploaded",
//     },

//     columns: [String],

//     // Parsed rows live in MongoDB so the backend stays stateless.
//     // A single MongoDB document is limited to 16 MB.
//     data: {
//       type: mongoose.Schema.Types.Mixed,
//       select: false,
//       default: [],
//     },

//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   }
// );

// const ExcelFile = mongoose.model(
//   "ExcelFile",
//   schema
// );

// export default ExcelFile;
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  fileName: {
    type: String,
    required: true,
  },

  fileType: {
    type: String,
    required: true,
  },

  rowCount: {
    type: Number,
    default: 0,
  },

  columnCount: {
    type: Number,
    default: 0,
  },

  sheets: [String],

  status: {
    type: String,
    enum: [
      "Uploaded",
      "Processing",
      "Completed",
      "Failed",
    ],
    default: "Uploaded",
  },

  columns: [String],

  data: {
    type: mongoose.Schema.Types.Mixed,
    select: false,
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ExcelFile = mongoose.model(
  "ExcelFile",
  schema
);

export default ExcelFile;