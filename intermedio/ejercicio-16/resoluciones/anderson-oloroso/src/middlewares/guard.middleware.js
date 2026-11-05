export const requireVipAccess = (req, res, next) => {
  const vipPass = req.headers['x-vip-pass'];
  if (!vipPass || vipPass !== 'SNEAKERHEAD-VIP-2026') {
    return res.status(403).json({
      ok: false,
      message: 'Acceso denegado a la bóveda exclusiva. Se requiere cabecera "x-vip-pass" válida.'
    });
  }
  next();
};
