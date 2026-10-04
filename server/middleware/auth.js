// const jwt = require('jsonwebtoken');
// const AppError = require('../utils/AppError');
// module.exports = (req, _res, next) => {
//   const header = req.headers.authorization || '';
//   const token = header.startsWith('Bearer ') ? header.slice(7) : null;
//   if (!token) return next(new AppError('Please log in to continue.', 401));
//   try {
//     req.user = { id: jwt.verify(token, process.env.JWT_SECRET).id };
//     next();
//   } catch {
//     next(new AppError('Your session has expired. Please log in again.', 401));
//   }
// };
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const auth = (req, _res, next) => {
  const header = req.headers.authorization || "";

  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : null;

  if (!token) {
    return next(
      new AppError("Please log in to continue.", 401)
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      id: decoded.id,
    };

    next();
  } catch {
    next(
      new AppError(
        "Your session has expired. Please log in again.",
        401
      )
    );
  }
};

export default auth;