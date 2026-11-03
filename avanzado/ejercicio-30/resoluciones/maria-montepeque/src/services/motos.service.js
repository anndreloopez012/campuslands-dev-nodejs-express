import { ErrorApp, noEncontrado, paginar } from "../utils/errores.js";

const PLACA = /^M\d{3}[A-Z]{3}$/; // placas de moto en Guatemala: M123ABC

export function crearMotosService(store) {
    function buscar(id) {
        const moto = store.motos.find((m) => m.id === id);
        if (!moto) throw noEncontrado("La moto", id);
        return moto;
    }

    function listar({ marca, clienteId } = {}, pagina) {
        const filtradas = store.motos.filter((m) => (!marca || m.marca.toLowerCase() === marca.toLowerCase()) && (!clienteId || m.clienteId === clienteId));
        return paginar(filtradas, pagina);
    }

    function crear(body = {}) {
        const errores = [];
        if (!store.clientes.some((c) => c.id === body.clienteId)) errores.push("clienteId no existe");
        for (const campo of ["marca", "modelo"]) if (typeof body[campo] !== "string" || body[campo].trim().length < 2) errores.push(`${campo} es obligatorio`);
        const anioActual = new Date().getFullYear();
        if (!Number.isInteger(body.anio) || body.anio < 1950 || body.anio > anioActual + 1) errores.push(`anio debe estar entre 1950 y ${anioActual + 1}`);
        if (!Number.isInteger(body.cilindraje) || body.cilindraje < 49 || body.cilindraje > 2500) errores.push("cilindraje debe ser de 49 a 2500 cc");
        const placa = typeof body.placa === "string" ? body.placa.toUpperCase().replaceAll(/[\s-]/g, "") : "";
        if (!PLACA.test(placa)) errores.push("placa debe tener el formato M123ABC");
        if (errores.length > 0) throw new ErrorApp(400, "Datos invalidos", errores);
        if (store.motos.some((m) => m.placa === placa)) throw new ErrorApp(409, `Ya existe una moto con placa ${placa}`);

        const moto = { id: store.siguiente.motos++, clienteId: body.clienteId, marca: body.marca.trim(), modelo: body.modelo.trim(), anio: body.anio, placa, cilindraje: body.cilindraje };
        store.motos.push(moto);
        return moto;
    }

    return { buscar, listar, crear };
}
