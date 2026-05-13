const apiResponse = (res, statusCode, data) => {
  return res.status(statusCode).json(data);
};

const successResponse = (res, message, data = {}) => {
  return apiResponse(res, 200, { success: true, message, ...data });
};

const errorResponse = (res, statusCode, message) => {
  return apiResponse(res, statusCode, { success: false, error: message });
};

module.exports = { apiResponse, successResponse, errorResponse };
