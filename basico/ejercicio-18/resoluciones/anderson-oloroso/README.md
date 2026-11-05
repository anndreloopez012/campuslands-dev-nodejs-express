# Ejercicio 18 – Rutas POST

**Autor:** Anderson Oloroso  
**Tema:** Paracaidismo

## Descripción

API Express con ruta POST para registrar saltos de paracaidismo. Validación de campos obligatorios.

## Ejecución

```bash
npm install
npm start
```

## Endpoints

```bash
# Listar saltos
curl http://localhost:3018/jumps

# Crear salto válido
curl -X POST http://localhost:3018/jumps \
  -H "Content-Type: application/json" \
  -d '{"diverName":"Carlos","altitude":4000}'

# Sin nombre → 400
curl -X POST http://localhost:3018/jumps \
  -H "Content-Type: application/json" \
  -d '{"altitude":3000}'

# Altitud inválida → 400
curl -X POST http://localhost:3018/jumps \
  -H "Content-Type: application/json" \
  -d '{"diverName":"Ana","altitude":-100}'
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   └── jumps.controller.js
    ├── routes/
    │   └── jumps.routes.js
    └── services/
        └── jumps.service.js
```
