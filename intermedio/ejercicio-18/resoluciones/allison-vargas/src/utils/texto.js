export const normalizar = (texto) =>
  String(texto).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');
