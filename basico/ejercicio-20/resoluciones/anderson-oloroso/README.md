# Ejercicio 20 – Middleware express.json

**Autor:** Anderson Oloroso  
**Tema:** Dibujo digital

## Descripción

API Express con middleware personalizado que captura errores de JSON malformado (`SyntaxError`) y devuelve un 400 limpio en vez del HTML de Express por defecto.

## Ejecución

```bash
npm install
npm start
```

## Endpoints

```bash
# Listar pinceles
curl http://localhost:3020/brushes

# Crear pincel válido
curl -X POST http://localhost:3020/brushes \
  -H "Content-Type: application/json" \
  -d '{"name":"Redondo fino","size":5,"opacity":0.8}'

# Validación de campos → 400
curl -X POST http://localhost:3020/brushes \
  -H "Content-Type: application/json" \
  -d '{"name":"","size":-1,"opacity":2}'

# JSON malformado → 400 (middleware)
curl -X POST http://localhost:3020/brushes \
  -H "Content-Type: application/json" \
  -d '{name:bad}'
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── middlewares/
    │   └── json-error-handler.js
    ├── controllers/
    │   └── brushes.controller.js
    ├── routes/
    │   └── brushes.routes.js
    └── services/
        └── brushes.service.js
```
