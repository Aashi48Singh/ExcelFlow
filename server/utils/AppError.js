// // class AppError extends Error {
// //   constructor(message, status = 400) { super(message); this.status = status; this.isOperational = true; }
// // }
// // module.exports = AppError;
// class AppError extends Error {
//   constructor(message, status = 400) {
//     super(message);
//     this.status = status;
//     this.isOperational = true;
//   }
// }

// export default AppError;
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);

    this.status = status;
    this.isOperational = true;
  }
}

export default AppError;