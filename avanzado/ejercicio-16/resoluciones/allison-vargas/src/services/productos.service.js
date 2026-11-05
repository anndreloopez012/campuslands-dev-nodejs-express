import { crear } from '../errores/index.js';
import { sinAcentos } from '../sanitizacion/texto.js';
import { paginar } from '../utils/paginacion.js';
import { validarProducto } from '../validators/producto.js';

function ordenar(lista, orden) {
  const campo = orden.replace('-', '');
  const signo = orden.startsWith('-') ? -1 : 1;
  return [...lista].sort((a, b) => {
    const comparacion = typeof a[campo] === 'string' ? a[campo].localeCompare(b[campo], 'es') : a[campo] - b[campo];
    return comparacion * signo || a.id - b.id;
  });
}

export function crearServicioProductos({ productos: base }) {
  const productos = structuredClone(base);
  let siguienteId = Math.max(0, ...productos.map((p) => p.id)) + 1;

  function producto(id) {
    const encontrado = productos.find((p) => p.id === id);
    if (!encontrado) throw crear('PRODUCTO_NO_ENCONTRADO', { productoId: id });
    return encontrado;
  }

  function exigirSkuLibre(sku, propioId) {
    if (productos.some((p) => p.sku === sku && p.id !== propioId)) throw crear('SKU_DUPLICADO', { sku });
  }

  return {
    buscar({
      filtros, orden, pagina, limite,
    }) {
      const q = filtros.q ? sinAcentos(filtros.q) : null;
      const encontrados = productos.filter((p) => (!q || sinAcentos(`${p.nombre} ${p.marca} ${p.descripcion}`).includes(q))
        && (!filtros.marca || sinAcentos(p.marca) === sinAcentos(filtros.marca))
        && (!filtros.categoria || p.categoria === filtros.categoria)
        && (!filtros.tallas || filtros.tallas.some((t) => p.tallas.includes(t)))
        && (filtros.precioMax === undefined || p.precio <= filtros.precioMax));
      return paginar(ordenar(encontrados, orden), pagina, limite);
    },

    obtener: (id) => structuredClone(producto(id)),

    crear(cuerpo) {
      const { datos, cambios } = validarProducto(cuerpo);
      exigirSkuLibre(datos.sku);
      const nuevo = { id: siguienteId, ...datos };
      siguienteId += 1;
      productos.push(nuevo);
      return { producto: structuredClone(nuevo), cambios };
    },

    actualizar(id, cuerpo) {
      const actual = producto(id);
      const { datos, cambios } = validarProducto(cuerpo, { parcial: true, categoriaActual: actual.categoria });
      if (datos.sku) exigirSkuLibre(datos.sku, id);
      Object.assign(actual, datos);
      return { producto: structuredClone(actual), cambios };
    },

    eliminar(id) {
      const actual = producto(id);
      productos.splice(productos.indexOf(actual), 1);
      return structuredClone(actual);
    },
  };
}
