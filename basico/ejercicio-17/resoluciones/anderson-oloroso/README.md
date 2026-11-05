# Ejercicio 17 – Rutas GET

**Autor:** Anderson Oloroso  
**Tema:** Viajes y turismo

## Descripción

API Express con rutas GET para consultar destinos turísticos. Valida parámetros y maneja errores.

## Ejecución

```bash
npm install
npm start
```

## Endpoints

```bash
# Listar destinos
curl http://localhost:3017/destinations

# Obtener destino por id
curl http://localhost:3017/destinations/1

# Id no numérico → 400
curl http://localhost:3017/destinations/abc

# Id inexistente → 404
curl http://localhost:3017/destinations/99
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── data/
    │   └── destinations.json
    ├── controllers/
    │   └── destinations.controller.js
    ├── routes/
    │   └── destinations.routes.js
    └── services/
        └── destinations.service.js
```
