import { AppError } from "../errors.js";

function allowMethods(...methods) {
  const allow = [...new Set([...methods, "OPTIONS"])].join(", ");

  return (req, res, next) => {
    res.set("Allow", allow);
    if (req.method === "OPTIONS") return res.status(204).end();

    next(new AppError(405, "METHOD_NOT_ALLOWED", `Metodo no permitido. Permitidos: ${allow}`));
  };
}

export { allowMethods };
