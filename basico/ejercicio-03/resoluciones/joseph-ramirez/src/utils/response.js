const success = (res, data) => {
    return res.status(200).json({
      ok: true,
      ...data
    });
  };
  
  const error = (res, message) => {
    return res.status(500).json({
      ok: false,
      message
    });
  };
  
  module.exports = {
    success,
    error
  };