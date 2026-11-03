import config from "../config/env.js";
import * as disenosService from "../services/disenos.service.js";
import * as citasService from "../services/citas.service.js";

// muestro la config que es publica, la api key no sale nunca
function verConfig(req, res) {
    res.json({
        ok: true,
        data: {
            entorno: config.nodeEnv,
            estudio: config.estudio,
            citas: config.citas,
            adminApiKey: config.adminApiKey ? "configurada (oculta)" : "no configurada"
        }
    });
}

function listDisenos(req, res) {
    const data = disenosService.findAll();
    res.json({ ok: true, estudio: config.estudio.nombre, total: data.length, data });
}

function createDiseno(req, res) {
    const nuevo = disenosService.create(req.body);
    res.status(201).json({ ok: true, data: nuevo });
}

function listCitas(req, res) {
    const data = citasService.findAll();
    res.json({ ok: true, total: data.length, data });
}

function createCita(req, res) {
    const nueva = citasService.create(req.body);
    res.status(201).json({ ok: true, data: nueva });
}

export { verConfig, listDisenos, createDiseno, listCitas, createCita };
