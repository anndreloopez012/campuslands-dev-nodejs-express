# Intermedio - Ejercicio 16: Rutas Protegidas
> **Autor:** Anderson Oloroso | **Temática:** Ropa y sneakers | **Tema:** Rutas protegidas

## Descripción
Demuestra la protección de rutas selectivas en Express mediante middlewares guardianes (`requireVipAccess`). Mientras que el catálogo de lanzamientos (`/api/sneakers/drops`) es accesible sin restricciones, la bóveda de piezas exclusivas (`/api/sneakers/vault`) exige la cabecera `x-vip-pass: SNEAKERHEAD-VIP-2026`.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-16/resoluciones/anderson-oloroso
npm install
npm start
npm run dev
```

## Endpoints
- `GET /intermedio/ejercicio-16` -> Health check.
- `GET /api/sneakers/drops` -> Público.
- `GET /api/sneakers/vault` -> Protegido (403 si falta el pase).

### Ejemplo con autorización
```bash
curl http://localhost:3000/api/sneakers/vault \
  -H "x-vip-pass: SNEAKERHEAD-VIP-2026"
```

## Estructura
```text
intermedio/ejercicio-16/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── controllers/
    │   └── sneakers.controller.js
    ├── middlewares/
    │   └── guard.middleware.js
    ├── routes/
    │   └── sneakers.routes.js
    └── services/
        └── sneakers.service.js
```
