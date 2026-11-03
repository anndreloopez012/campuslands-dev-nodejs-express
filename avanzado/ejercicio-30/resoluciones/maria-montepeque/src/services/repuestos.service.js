import { conflicto, ErrorApp, noEncontrado } from "../utils/errores.js";

// inventario: "stock" es lo que hay en bodega, "reservado" lo que ya esta apartado para ordenes
// disponible = stock - reservado
export function crearRepuestosService(store) {
    const conDisponible = (r) => ({ ...r, disponible: r.stock - r.reservado, bajoStock: r.stock - r.reservado < r.minimo });

    function buscar(id) {
        const r = store.repuestos.find((x) => x.id === id);
        if (!r) throw noEncontrado("El repuesto", id);
        return r;
    }

    return {
        buscar,
        listar: ({ bajoStock } = {}) => store.repuestos.map(conDisponible).filter((r) => !bajoStock || r.bajoStock),

        reservar(id, cantidad) {
            const r = buscar(id);
            if (r.stock - r.reservado < cantidad) throw conflicto(`Solo hay ${r.stock - r.reservado} de "${r.nombre}" disponibles`);
            r.reservado += cantidad;
            return r;
        },

        // al cancelar la orden se devuelve lo apartado
        liberar(id, cantidad) {
            const r = buscar(id);
            r.reservado = Math.max(0, r.reservado - cantidad);
        },

        // al entregar la moto, lo reservado sale de bodega de verdad
        consumir(id, cantidad) {
            const r = buscar(id);
            r.reservado -= cantidad;
            r.stock -= cantidad;
        },

        ajustarStock(id, { cantidad, motivo } = {}) {
            const r = buscar(id);
            if (!Number.isInteger(cantidad) || cantidad === 0) throw new ErrorApp(400, "cantidad debe ser un entero distinto de 0 (positivo entra, negativo sale)");
            if (typeof motivo !== "string" || motivo.trim().length < 3) throw new ErrorApp(400, "motivo es obligatorio");
            if (r.stock + cantidad < r.reservado) throw conflicto(`No se puede dejar el stock debajo de lo reservado (${r.reservado})`);
            r.stock += cantidad;
            return conDisponible(r);
        }
    };
}
