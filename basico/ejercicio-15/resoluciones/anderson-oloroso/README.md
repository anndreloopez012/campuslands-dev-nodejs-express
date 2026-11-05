# Ejercicio 15 – Mini API HTTP Nativa

**Autor:** Anderson Oloroso  
**Tema:** Comida urbana

## Descripción

Servidor HTTP nativo (sin Express) que expone un menú de comida urbana callejera.

## Ejecución

```bash
npm start
```

## Endpoints

```bash
# Health check
curl http://localhost:3015/health

# Listar menú
curl http://localhost:3015/menu

# Ruta inexistente → 404
curl http://localhost:3015/nope
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── server.js
    └── data/
        └── menu.json
```
