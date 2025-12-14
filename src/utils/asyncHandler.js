// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success : false ,
//       message : error.message
//     })
//   }
// };
const asyncHandler = (functionHandler) => {
  return (req, res, next) => {
    // check if any error is occured regarding to async handler
    Promise.resolve(functionHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export { asyncHandler };
