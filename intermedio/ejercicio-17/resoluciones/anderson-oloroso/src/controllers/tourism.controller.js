export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'roles y permisos' });

export const getPackages = (_req, res) => res.status(200).json({
  ok: true,
  acceso: 'Público / Clientes',
  data: [
    { destino: 'San Andrés Islas', dias: 4, precioUSD: 450 },
    { destino: 'Cartagena de Indias', dias: 3, precioUSD: 380 }
  ]
});

export const getDiscounts = (req, res) => res.status(200).json({
  ok: true,
  acceso: 'Agentes y Administradores',
  rolUsuario: req.user.role,
  data: { descuentoCorporativo: '25% en hoteles aliados', comisionAgencia: '12%' }
});

export const getAuditLogs = (req, res) => res.status(200).json({
  ok: true,
  acceso: 'Exclusivo Administrador',
  rolUsuario: req.user.role,
  logs: [
    { accion: 'Cambio de tarifas globales', admin: 'RootAdmin', fecha: '2026-10-28' }
  ]
});
