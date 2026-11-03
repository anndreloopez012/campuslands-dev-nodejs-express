export const enviar = (res, data, status = 200, message) => {
  const body = { ok: true };
  if (message) body.message = message;
  body.data = data;
  return res.status(status).json(body);
};
