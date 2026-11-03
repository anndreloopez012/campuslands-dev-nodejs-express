import { ValidationError } from "../../utils/customErrors.js";

// Función de orden superior que ejecuta un esquema validador sobre la petición
export const validate = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req);

    if (errors && errors.length > 0) {
      return next(new ValidationError(errors));
    }

    next();
  };
};