export const successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

export const errorResponse = (res, message = 'Internal Server Error', code = 'SERVER_ERROR', statusCode = 500, details = null) => {
  const errorObj = {
    code,
    message
  };

  if (details) {
    errorObj.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorObj
  });
};
