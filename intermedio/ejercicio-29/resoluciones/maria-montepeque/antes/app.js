// VERSION ANTES DEL REFACTOR
// asi estaba la API: todo en un archivo, funciona pero cuesta mantenerla
// la dejo para comparar y para correr los mismos tests contra las dos versiones
import express from "express";

export function crearApp() {
    var app = express();
    app.use(express.json());

    var equipos = [
        { id: 1, nombre: "Comunicaciones", modalidad: "futbol", ciudad: "Guatemala" },
        { id: 2, nombre: "Municipal", modalidad: "futbol", ciudad: "Guatemala" },
        { id: 3, nombre: "Xelaju", modalidad: "futbol", ciudad: "Quetzaltenango" },
        { id: 4, nombre: "Glucosoral", modalidad: "futsal", ciudad: "Guatemala" },
        { id: 5, nombre: "Bufalos", modalidad: "futsal", ciudad: "Mixco" }
    ];
    var partidos = [
        { id: 1, localId: 1, visitanteId: 2, golesLocal: 2, golesVisitante: 2 },
        { id: 2, localId: 3, visitanteId: 1, golesLocal: 1, golesVisitante: 0 },
        { id: 3, localId: 4, visitanteId: 5, golesLocal: 5, golesVisitante: 3 }
    ];
    var ultimoEquipo = 5;
    var ultimoPartido = 3;

    app.get("/health", function (req, res) {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "refactor de API" });
    });

    app.get("/api/equipos", function (req, res) {
        if (req.query.modalidad != undefined) {
            if (req.query.modalidad != "futbol" && req.query.modalidad != "futsal") {
                res.status(400).json({ ok: false, message: "modalidad debe ser futbol o futsal" });
                return;
            }
            var lista = [];
            for (var i = 0; i < equipos.length; i++) {
                if (equipos[i].modalidad == req.query.modalidad) lista.push(equipos[i]);
            }
            res.json({ ok: true, total: lista.length, data: lista });
        } else {
            res.json({ ok: true, total: equipos.length, data: equipos });
        }
    });

    app.get("/api/equipos/:id", function (req, res) {
        var id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ ok: false, message: "El id debe ser un numero entero positivo" });
            return;
        }
        var equipo = null;
        for (var i = 0; i < equipos.length; i++) {
            if (equipos[i].id == id) equipo = equipos[i];
        }
        if (equipo == null) {
            res.status(404).json({ ok: false, message: "No existe el equipo con id " + id });
            return;
        }
        res.json({ ok: true, data: equipo });
    });

    app.post("/api/equipos", function (req, res) {
        var b = req.body || {};
        var errores = [];
        if (typeof b.nombre != "string" || b.nombre.trim().length < 3 || b.nombre.trim().length > 30) errores.push("nombre debe tener entre 3 y 30 letras");
        if (b.modalidad != "futbol" && b.modalidad != "futsal") errores.push("modalidad debe ser futbol o futsal");
        if (typeof b.ciudad != "string" || b.ciudad.trim().length < 2) errores.push("ciudad es obligatoria");
        if (errores.length > 0) {
            res.status(400).json({ ok: false, message: "Datos invalidos", errors: errores });
            return;
        }
        for (var i = 0; i < equipos.length; i++) {
            if (equipos[i].nombre.toLowerCase() == b.nombre.trim().toLowerCase() && equipos[i].modalidad == b.modalidad) {
                res.status(409).json({ ok: false, message: "Ya existe " + b.nombre.trim() + " en " + b.modalidad });
                return;
            }
        }
        ultimoEquipo++;
        var nuevo = { id: ultimoEquipo, nombre: b.nombre.trim(), modalidad: b.modalidad, ciudad: b.ciudad.trim() };
        equipos.push(nuevo);
        res.status(201).location("/api/equipos/" + nuevo.id).json({ ok: true, data: nuevo });
    });

    app.put("/api/equipos/:id", function (req, res) {
        var id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ ok: false, message: "El id debe ser un numero entero positivo" });
            return;
        }
        var equipo = null;
        for (var i = 0; i < equipos.length; i++) {
            if (equipos[i].id == id) equipo = equipos[i];
        }
        if (equipo == null) {
            res.status(404).json({ ok: false, message: "No existe el equipo con id " + id });
            return;
        }
        var b = req.body || {};
        var errores = [];
        if (typeof b.nombre != "string" || b.nombre.trim().length < 3 || b.nombre.trim().length > 30) errores.push("nombre debe tener entre 3 y 30 letras");
        if (typeof b.ciudad != "string" || b.ciudad.trim().length < 2) errores.push("ciudad es obligatoria");
        if (b.modalidad != undefined && b.modalidad != equipo.modalidad) errores.push("la modalidad no se puede cambiar");
        if (errores.length > 0) {
            res.status(400).json({ ok: false, message: "Datos invalidos", errors: errores });
            return;
        }
        for (var j = 0; j < equipos.length; j++) {
            if (equipos[j].id != id && equipos[j].nombre.toLowerCase() == b.nombre.trim().toLowerCase() && equipos[j].modalidad == equipo.modalidad) {
                res.status(409).json({ ok: false, message: "Ya existe " + b.nombre.trim() + " en " + equipo.modalidad });
                return;
            }
        }
        equipo.nombre = b.nombre.trim();
        equipo.ciudad = b.ciudad.trim();
        res.json({ ok: true, data: equipo });
    });

    app.delete("/api/equipos/:id", function (req, res) {
        var id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ ok: false, message: "El id debe ser un numero entero positivo" });
            return;
        }
        var pos = -1;
        for (var i = 0; i < equipos.length; i++) {
            if (equipos[i].id == id) pos = i;
        }
        if (pos == -1) {
            res.status(404).json({ ok: false, message: "No existe el equipo con id " + id });
            return;
        }
        for (var j = 0; j < partidos.length; j++) {
            if (partidos[j].localId == id || partidos[j].visitanteId == id) {
                res.status(409).json({ ok: false, message: "No se puede borrar un equipo que ya jugo partidos" });
                return;
            }
        }
        equipos.splice(pos, 1);
        res.status(204).send();
    });

    app.get("/api/partidos", function (req, res) {
        if (req.query.equipoId != undefined) {
            var id = Number(req.query.equipoId);
            if (!Number.isInteger(id) || id < 1) {
                res.status(400).json({ ok: false, message: "El id debe ser un numero entero positivo" });
                return;
            }
            var lista = [];
            for (var i = 0; i < partidos.length; i++) {
                if (partidos[i].localId == id || partidos[i].visitanteId == id) lista.push(partidos[i]);
            }
            res.json({ ok: true, total: lista.length, data: lista });
        } else {
            res.json({ ok: true, total: partidos.length, data: partidos });
        }
    });

    app.post("/api/partidos", function (req, res) {
        var b = req.body || {};
        var errores = [];
        if (!Number.isInteger(b.localId)) errores.push("localId debe ser un numero entero");
        if (!Number.isInteger(b.visitanteId)) errores.push("visitanteId debe ser un numero entero");
        if (!Number.isInteger(b.golesLocal) || b.golesLocal < 0 || b.golesLocal > 99) errores.push("golesLocal debe ser un entero de 0 a 99");
        if (!Number.isInteger(b.golesVisitante) || b.golesVisitante < 0 || b.golesVisitante > 99) errores.push("golesVisitante debe ser un entero de 0 a 99");
        if (errores.length > 0) {
            res.status(400).json({ ok: false, message: "Datos invalidos", errors: errores });
            return;
        }
        if (b.localId == b.visitanteId) {
            res.status(400).json({ ok: false, message: "Un equipo no puede jugar contra si mismo" });
            return;
        }
        var local = null;
        var visitante = null;
        for (var i = 0; i < equipos.length; i++) {
            if (equipos[i].id == b.localId) local = equipos[i];
            if (equipos[i].id == b.visitanteId) visitante = equipos[i];
        }
        if (local == null) {
            res.status(404).json({ ok: false, message: "No existe el equipo con id " + b.localId });
            return;
        }
        if (visitante == null) {
            res.status(404).json({ ok: false, message: "No existe el equipo con id " + b.visitanteId });
            return;
        }
        if (local.modalidad != visitante.modalidad) {
            res.status(400).json({ ok: false, message: "Un equipo de futbol no puede jugar contra uno de futsal" });
            return;
        }
        ultimoPartido++;
        var nuevo = { id: ultimoPartido, localId: b.localId, visitanteId: b.visitanteId, golesLocal: b.golesLocal, golesVisitante: b.golesVisitante };
        partidos.push(nuevo);
        res.status(201).json({ ok: true, data: nuevo });
    });

    app.get("/api/tabla", function (req, res) {
        var m = req.query.modalidad;
        if (m != "futbol" && m != "futsal") {
            res.status(400).json({ ok: false, message: "modalidad debe ser futbol o futsal" });
            return;
        }
        var tabla = [];
        for (var i = 0; i < equipos.length; i++) {
            if (equipos[i].modalidad == m) {
                tabla.push({ equipoId: equipos[i].id, nombre: equipos[i].nombre, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
            }
        }
        for (var j = 0; j < partidos.length; j++) {
            var p = partidos[j];
            var l = null;
            var v = null;
            for (var k = 0; k < tabla.length; k++) {
                if (tabla[k].equipoId == p.localId) l = tabla[k];
                if (tabla[k].equipoId == p.visitanteId) v = tabla[k];
            }
            if (l == null || v == null) continue;
            l.pj++;
            v.pj++;
            l.gf += p.golesLocal;
            l.gc += p.golesVisitante;
            v.gf += p.golesVisitante;
            v.gc += p.golesLocal;
            if (p.golesLocal > p.golesVisitante) {
                l.pg++;
                v.pp++;
                l.pts += 3;
            } else if (p.golesLocal < p.golesVisitante) {
                v.pg++;
                l.pp++;
                v.pts += 3;
            } else {
                l.pe++;
                v.pe++;
                l.pts += 1;
                v.pts += 1;
            }
        }
        for (var n = 0; n < tabla.length; n++) tabla[n].dg = tabla[n].gf - tabla[n].gc;
        tabla.sort(function (a, b) {
            if (b.pts != a.pts) return b.pts - a.pts;
            if (b.dg != a.dg) return b.dg - a.dg;
            if (b.gf != a.gf) return b.gf - a.gf;
            return a.nombre.localeCompare(b.nombre);
        });
        res.json({ ok: true, modalidad: m, data: tabla });
    });

    app.use(function (req, res) {
        res.status(404).json({ ok: false, message: "La ruta " + req.method + " " + req.originalUrl + " no existe" });
    });

    app.use(function (err, req, res, next) {
        if (err.type == "entity.parse.failed") {
            res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
            return;
        }
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
