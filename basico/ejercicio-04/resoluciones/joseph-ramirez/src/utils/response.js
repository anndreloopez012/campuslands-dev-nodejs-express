export const successResponse = (res, data) => {
    return res.status(200).json({
      ok: true,
      ...data
    });
  };
  
  export const errorResponse = (res, message) => {
    return res.status(500).json({
      ok: false,
      message
    });
  };