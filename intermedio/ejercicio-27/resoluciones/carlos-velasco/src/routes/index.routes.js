const { Router } = require('express');
const { API_DOCUMENTACION, aOpenapi } = require('../docs/api.docs');
const apiRoutes = require('./api.routes');

const router = Router();

// Endpoints de negocio
router.use(apiRoutes);

// SELF-SERVICE: la API se documenta a si misma
// /openapi.json -> estructura OpenAPI 3.0 importable en Swagger/Postman
router.get('/openapi.json', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.status(200).json(aOpenapi());
});

// /docs -> version human-readable de la misma fuente unica
router.get('/docs', (req, res) => {
  res.status(200).json({
    ok: true,
    version: API_DOCUMENTACION.version,
    descripcion: 'Documentacion viva: la misma fuente genera /openapi.json',
    grupos: API_DOCUMENTACION.grupos.map((grupo) => ({
      grupo: grupo.nombre,
      descripcion: grupo.descripcion,
      endpoints: grupo.endpoints.map((endpoint) => ({
        metodo: endpoint.metodo,
        ruta: endpoint.ruta,
        resumen: endpoint.resumen,
        body_declarado: Boolean(endpoint.body),
        respuestas: endpoint.respuestas.map((r) => r.codigo)
      }))
    }))
  });
});

module.exports = router;
