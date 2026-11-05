export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'rate limit conceptual' });

export const requestRender = (req, res) => {
  const { proyecto, framesTotales } = req.body;
  return res.status(201).json({
    ok: true,
    message: 'Trabajo de renderizado 3D encolado exitosamente en la granja',
    jobId: `RENDER-${Date.now()}`,
    proyecto: proyecto || 'Escena 3D General',
    frames: framesTotales || 100,
    estado: 'En cola'
  });
};
