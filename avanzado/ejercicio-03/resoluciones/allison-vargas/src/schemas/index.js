import { Texto } from './texto.js';
import { Numero, Entero } from './numeros.js';
import { Booleano, Enumerado, Literal } from './simples.js';
import { Fecha, FechaHora } from './fechas.js';
import { Arreglo } from './arreglo.js';
import { Objeto } from './objeto.js';
import { UnionPor } from './union.js';

export { formatearRuta } from './base.js';
export { Objeto };

export const s = {
  texto: () => new Texto(),
  numero: () => new Numero(),
  entero: () => new Entero(),
  booleano: () => new Booleano(),
  enumerado: (valores) => new Enumerado({ valores: [...valores] }),
  literal: (valor) => new Literal({ valor }),
  fecha: () => new Fecha(),
  fechaHora: () => new FechaHora(),
  arreglo: (item) => new Arreglo({ item }),
  objeto: (shape) => new Objeto({ shape }),
  unionPor: (clave, variantes) => new UnionPor({ clave, variantes }),
};
