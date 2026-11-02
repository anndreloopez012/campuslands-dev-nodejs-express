import { ValidationError } from "../../utils/customErrors.js";

export const validate = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req);
    if (errors && errors.length > 0) {
      return next(new ValidationError(errors));
    }
    next();
  };
};