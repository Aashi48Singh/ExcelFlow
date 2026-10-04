// // const mongoose = require('mongoose');
// // const schema = new mongoose.Schema({
// //   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
// //   name: { type: String, required: true, trim: true, maxlength: 120 },
// //   description: { type: String, default: '', maxlength: 500 },
// //   rules: { type: [mongoose.Schema.Types.Mixed], default: [] },
// // }, { timestamps: true });
// // module.exports = mongoose.model('Automation', schema);
// import mongoose from "mongoose";

// const schema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 120,
//     },

//     description: {
//       type: String,
//       default: "",
//       maxlength: 500,
//     },

//     rules: {
//       type: [mongoose.Schema.Types.Mixed],
//       default: [],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Automation = mongoose.model("Automation", schema);

// export default Automation;
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    rules: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Automation = mongoose.model(
  "Automation",
  schema
);

export default Automation;