// envoltorio de funciones asincronas
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};