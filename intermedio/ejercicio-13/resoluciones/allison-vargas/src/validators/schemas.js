export const CLASES = ['carguero', 'explorador', 'militar', 'cientifica'];
export const RANGOS = ['capitan', 'oficial', 'piloto', 'ingeniero', 'medico', 'cadete'];
export const ESPECIES = ['humano', 'androide', 'cyborg', 'marciano'];
export const ESTADOS = ['planificada', 'en-curso', 'completada', 'cancelada'];
export const ROLES = ['lider', 'apoyo', 'especialista'];

export const esquemaNave = {
  nombre: { tipo: 'texto', min: 2, max: 60, requerido: true },
  clase: { tipo: 'enum', valores: CLASES, requerido: true },
  anioLanzamiento: { tipo: 'entero', min: 2100, max: 2400, requerido: true },
  capacidad: { tipo: 'entero', min: 1, max: 50, requerido: true },
};

export const esquemaTripulante = {
  nombre: { tipo: 'texto', min: 2, max: 60, requerido: true },
  rango: { tipo: 'enum', valores: RANGOS, requerido: true },
  especie: { tipo: 'enum', valores: ESPECIES, porDefecto: 'humano' },
  naveId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
};

export const esquemaMision = {
  nombre: { tipo: 'texto', min: 3, max: 80, requerido: true },
  destino: { tipo: 'texto', min: 2, max: 60, requerido: true },
  estado: { tipo: 'enum', valores: ESTADOS, porDefecto: 'planificada' },
  naveId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
  inicio: { tipo: 'fecha', requerido: true },
};

export const esquemaAsignacion = {
  tripulanteId: { tipo: 'entero', min: 1, max: 1000000, requerido: true },
  rol: { tipo: 'enum', valores: ROLES, porDefecto: 'apoyo' },
};
