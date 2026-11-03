import { Router } from "express";
import { SINTOMAS } from "../trabajos/diagnostico.js";

const SIMULACIONES = ["fallar-siempre", "fallar-2-veces", "lento"];

class ErrorHttp extends Error {
    constructor(status, mensaje, errores) {
        super(mensaje);
        this.status = status;
        this.errores = errores;
    }
}

export function crearRutas({ cola, permitirSimulacion }) {
    const router = Router();

    function idTarea(texto) {
        const id = Number(texto);
        if (!Number.isInteger(id) || id < 1) throw new ErrorHttp(400, "El id debe ser un entero positivo");
        return id;
    }

    function validarDiagnostico(body = {}) {
        const errores = [];
        if (typeof body.placa !== "string" || !/^M\d{3}[A-Z]{3}$/.test(body.placa)) errores.push("placa debe tener el formato M123ABC");
        if (!Array.isArray(body.sintomas) || body.sintomas.length === 0 || body.sintomas.length > 5) {
            errores.push("sintomas debe ser una lista de 1 a 5");
        } else {
            const raros = body.sintomas.filter((s) => !Object.hasOwn(SINTOMAS, s));
            if (raros.length > 0) errores.push(`sintomas no conocidos: ${raros.join(", ")}`);
        }
        if (typeof body.telefono !== "string" || !/^\d{8}$/.test(body.telefono)) errores.push("telefono debe tener 8 numeros");
        if (body.prioridad !== undefined && !["alta", "normal", "baja"].includes(body.prioridad)) errores.push("prioridad debe ser alta, normal o baja");
        if (body.simular !== undefined && (!permitirSimulacion || !SIMULACIONES.includes(body.simular))) {
            errores.push(permitirSimulacion ? `simular debe ser uno de: ${SIMULACIONES.join(", ")}` : "simular no esta permitido");
        }
        if (errores.length > 0) throw new ErrorHttp(400, "Datos invalidos", errores);
    }

    // el cliente pide un diagnostico y NO espera a que termine
    router.post("/diagnosticos", (req, res) => {
        validarDiagnostico(req.body);
        const { placa, sintomas, telefono, prioridad, simular } = req.body;

        const tarea = cola.encolar("diagnostico", { placa, sintomas: [...new Set(sintomas)], telefono, simular }, { prioridad });

        // 202 Accepted: "lo recibi, lo voy a hacer"
        // Location dice donde consultar como va, Retry-After cada cuanto preguntar
        res.status(202)
            .location(`/api/tareas/${tarea.id}`)
            .set("Retry-After", "1")
            .json({ ok: true, message: "Diagnostico en cola", data: { tareaId: tarea.id, estado: tarea.estado, consultar: `/api/tareas/${tarea.id}` } });
    });

    router.get("/sintomas", (req, res) => {
        res.json({ ok: true, data: SINTOMAS });
    });

    router.get("/tareas", (req, res) => {
        res.json({ ok: true, data: cola.listar({ estado: req.query.estado }) });
    });

    router.get("/tareas/:id", (req, res) => {
        const tarea = cola.obtener(idTarea(req.params.id));
        if (!tarea) throw new ErrorHttp(404, `No existe la tarea ${req.params.id}`);

        // mientras no termina, le digo al cliente que vuelva a preguntar
        if (!["completada", "fallida"].includes(tarea.estado)) res.set("Retry-After", "1");
        res.json({ ok: true, data: tarea });
    });

    router.post("/tareas/:id/reintentar", (req, res) => {
        const id = idTarea(req.params.id);
        let tarea;
        try {
            tarea = cola.reintentar(id);
        } catch (error) {
            throw new ErrorHttp(409, error.message);
        }
        if (!tarea) throw new ErrorHttp(404, `No existe la tarea ${id}`);
        res.status(202).location(`/api/tareas/${id}`).json({ ok: true, data: tarea });
    });

    router.get("/cola", (req, res) => {
        res.json({ ok: true, data: { ...cola.estadisticas(), muertas: cola.muertas() } });
    });

    router.post("/cola/pausar", (req, res) => {
        cola.pausar();
        res.json({ ok: true, data: cola.estadisticas() });
    });

    router.post("/cola/reanudar", (req, res) => {
        cola.reanudar();
        res.json({ ok: true, data: cola.estadisticas() });
    });

    return { router, ErrorHttp };
}
