const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length && { errors }),
  });
};

const paginatedResponse = (res, data, total, page, limit, message = 'Success') => {
  const pages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
    },
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
