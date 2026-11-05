# Ejercicio 16 – Primer Servidor Express

**Autor:** Anderson Oloroso  
**Tema:** Ropa y sneakers

## Descripción

Primer servidor con Express: ruta raíz, health check y manejo de 404.

## Ejecución

```bash
npm install
npm start
```

## Endpoints

```bash
# Bienvenida
curl http://localhost:3016/

# Health check
curl http://localhost:3016/health

# Ruta inexistente → 404
curl http://localhost:3016/nope
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    └── routes/
        └── health.routes.js
```
