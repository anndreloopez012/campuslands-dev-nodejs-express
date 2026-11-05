export const esquemaSolicitudSubida = {
  nombre: { tipo: 'texto', min: 3, max: 120, requerido: true },
  tipoMime: { tipo: 'texto', min: 3, max: 100, requerido: true },
  tamanoBytes: { tipo: 'entero', min: 1, max: 10000000000, requerido: true },
  checksum: { tipo: 'texto', min: 64, max: 64, requerido: true },
};

export const esquemaConfirmacion = {
  bytesRecibidos: { tipo: 'entero', min: 0, max: 10000000000, requerido: true },
  checksum: { tipo: 'texto', min: 64, max: 64, requerido: true },
};
