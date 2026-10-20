export function validateMotorcycle(request, response, next) {
  const { brand, cc } = request.body ?? {};
  if (typeof brand !== 'string' || !brand.trim() || !Number.isFinite(cc) || cc <= 0) {
    return response.status(400).json({ error: 'brand debe ser texto y cc un número positivo.' });
  }
  request.motorcycle = { brand: brand.trim(), cc };
  return next();
}
