# Basico 21 - estructura src routes controllers

Tematica: animacion 3D

## Instalar

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

El servidor corre en http://localhost:3000

## Probar

```bash
curl http://localhost:3000/basico/ejercicio-21
curl http://localhost:3000/basico/ejercicio-21/animaciones
curl http://localhost:3000/basico/ejercicio-21/animaciones/2
curl http://localhost:3000/basico/ejercicio-21/animaciones/99
curl http://localhost:3000/basico/ejercicio-21/animaciones/abc
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/
│   ├── index.routes.js
│   └── animaciones.routes.js
├── controllers/
│   ├── principal.controller.js
│   └── animaciones.controller.js
└── services/
    └── animaciones.service.js
```
