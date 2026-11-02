const nodeEnv = process.env.NODE_ENV || "development";

const port = Number(process.env.PORT) || 3000;

const apiName = process.env.API_NAME || "Battle Royale API";

if (!["development", "production"].includes(nodeEnv)) {
  throw new Error(
    'NODE_ENV debe tener el valor "development" o "production"'
  );
}

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("PORT debe ser un número entero válido entre 1 y 65535");
}

module.exports = {
  nodeEnv,
  port,
  apiName
};