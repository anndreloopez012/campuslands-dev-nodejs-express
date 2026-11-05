export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'CORS controlado' });

export const getArtworks = (_req, res) => res.status(200).json({
  ok: true,
  plataforma: 'Galería de Ilustración y Dibujo Digital',
  total: 2,
  artworks: [
    { id: 1, obra: 'Cyberpunk Geisha', software: 'Procreate', resolucion: '4K', autor: 'DevArtist' },
    { id: 2, obra: 'Neon Samurai', software: 'Photoshop', resolucion: '8K', autor: 'PixelMaster' }
  ]
});
