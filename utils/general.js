exports.sendSuccess = (res, message = 'Success', data = {}, status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data
    });
};

exports.sendError = (
    res,
    message = 'Something went wrong',
    {
        errorCode = 'INTERNAL_ERROR',
        errors = [],
        status = 500
    } = {}
) => {
    return res.status(status).json({
        success: false,
        message,
        errorCode,
        errors
    });
};

exports.validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return passwordRegex.test(password);
};