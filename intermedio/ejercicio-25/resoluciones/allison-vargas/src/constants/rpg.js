export const NIVEL_MAX = 50;
export const MAX_ESPACIOS = 20;
export const ORO_INICIAL = 100;

export const CLASES = {
  guerrero: { vida: 100, mana: 10, vidaPorNivel: 12, manaPorNivel: 2 },
  mago: { vida: 60, mana: 100, vidaPorNivel: 5, manaPorNivel: 8 },
  arquero: { vida: 80, mana: 40, vidaPorNivel: 8, manaPorNivel: 4 },
  clerigo: { vida: 75, mana: 80, vidaPorNivel: 7, manaPorNivel: 6 },
  picaro: { vida: 70, mana: 30, vidaPorNivel: 7, manaPorNivel: 3 },
};

export const NOMBRES_CLASES = Object.keys(CLASES);
export const DIFICULTADES = ['facil', 'media', 'dificil', 'epica'];
export const TIPOS_ITEM = ['arma', 'armadura', 'pocion', 'material'];
export const RAREZAS = ['comun', 'raro', 'epico', 'legendario'];
