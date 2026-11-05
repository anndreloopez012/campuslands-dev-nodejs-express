import express from 'express';

export function crearAppLegacy() {
  var app = express();
  app.use(express.json());

  var equipos = [];
  var partidos = [];

  app.get('/intermedio/ejercicio-29', function (req, res) {
    res.json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'refactor de API' });
  });

  app.get('/intermedio/ejercicio-29/equipos', function (req, res) {
    var r = [];
    for (var i = 0; i < equipos.length; i++) {
      if (!req.query.modalidad || equipos[i].modalidad == req.query.modalidad) {
        r.push(equipos[i]);
      }
    }
    res.json(r);
  });

  app.post('/intermedio/ejercicio-29/equipos', function (req, res) {
    var b = req.body;
    if (!b.nombre || !b.modalidad) {
      res.json({ error: 'faltan datos' });
      return;
    }
    if (b.modalidad != 'futbol' && b.modalidad != 'futbol_sala') {
      res.json({ error: 'modalidad invalida' });
      return;
    }
    for (var i = 0; i < equipos.length; i++) {
      if (equipos[i].nombre.toLowerCase() == b.nombre.toLowerCase()) {
        res.json({ error: 'ya existe' });
        return;
      }
    }
    var e = { id: equipos.length + 1, nombre: b.nombre, modalidad: b.modalidad };
    equipos.push(e);
    res.json(e);
  });

  app.get('/intermedio/ejercicio-29/equipos/:id', function (req, res) {
    for (var i = 0; i < equipos.length; i++) {
      if (equipos[i].id == req.params.id) {
        res.json(equipos[i]);
        return;
      }
    }
    res.json({ error: 'no existe' });
  });

  app.get('/intermedio/ejercicio-29/partidos', function (req, res) {
    res.json(partidos);
  });

  app.post('/intermedio/ejercicio-29/partidos', function (req, res) {
    var b = req.body;
    if (b.localId === undefined || b.visitanteId === undefined || b.golesLocal === undefined || b.golesVisitante === undefined) {
      res.json({ error: 'faltan datos' });
      return;
    }
    var l = null;
    var v = null;
    for (var i = 0; i < equipos.length; i++) {
      if (equipos[i].id == b.localId) l = equipos[i];
      if (equipos[i].id == b.visitanteId) v = equipos[i];
    }
    if (!l || !v) {
      res.json({ error: 'equipo no existe' });
      return;
    }
    if (l.id == v.id) {
      res.json({ error: 'mismo equipo' });
      return;
    }
    if (l.modalidad != v.modalidad) {
      res.json({ error: 'modalidades distintas' });
      return;
    }
    var p = { id: partidos.length + 1, localId: b.localId, visitanteId: b.visitanteId, golesLocal: b.golesLocal, golesVisitante: b.golesVisitante };
    partidos.push(p);
    res.json(p);
  });

  app.get('/intermedio/ejercicio-29/tabla', function (req, res) {
    var m = req.query.modalidad;
    if (!m) {
      res.json({ error: 'falta modalidad' });
      return;
    }
    if (m != 'futbol' && m != 'futbol_sala') {
      res.json({ error: 'modalidad invalida' });
      return;
    }
    var t = [];
    for (var i = 0; i < equipos.length; i++) {
      if (equipos[i].modalidad == m) {
        t.push({ equipoId: equipos[i].id, nombre: equipos[i].nombre, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
      }
    }
    for (var j = 0; j < partidos.length; j++) {
      var p = partidos[j];
      for (var k = 0; k < t.length; k++) {
        if (t[k].equipoId == p.localId) {
          t[k].pj++;
          t[k].gf += p.golesLocal;
          t[k].gc += p.golesVisitante;
          if (p.golesLocal > p.golesVisitante) {
            t[k].g++;
            t[k].pts += 3;
          } else if (p.golesLocal == p.golesVisitante) {
            t[k].e++;
            t[k].pts += 1;
          } else {
            t[k].p++;
          }
        }
        if (t[k].equipoId == p.visitanteId) {
          t[k].pj++;
          t[k].gf += p.golesVisitante;
          t[k].gc += p.golesLocal;
          if (p.golesVisitante > p.golesLocal) {
            t[k].g++;
            t[k].pts += 3;
          } else if (p.golesVisitante == p.golesLocal) {
            t[k].e++;
            t[k].pts += 1;
          } else {
            t[k].p++;
          }
        }
      }
    }
    for (var n = 0; n < t.length; n++) {
      t[n].dg = t[n].gf - t[n].gc;
    }
    t.sort(function (a, b) {
      return b.pts - a.pts || b.dg - a.dg;
    });
    res.json(t);
  });

  return app;
}
