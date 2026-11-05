# Intermedio - Ejercicio 23: Testing con node:test
> **Autor:** Anderson Oloroso | **Temática:** Soldadura | **Tema:** Testing con node test

## Descripción
Implementa una suite de pruebas unitarias automatizadas utilizando el módulo nativo de Node.js `node:test` y `node:assert/strict` para verificar cálculos de calor aportado (Heat Input) en procesos de soldadura industrial, sin dependencias externas como Jest o Mocha.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-23/resoluciones/anderson-oloroso
npm install
npm test       # Ejecuta pruebas nativas con node:test
npm start      # Inicia el servidor
```

## Endpoints
- `GET /intermedio/ejercicio-23` -> Health check.
- `POST /api/welding/heat-input` -> Cálculo de Heat Input.

## Estructura
```text
intermedio/ejercicio-23/resoluciones/anderson-oloroso/
├── package.json
├── README.md
├── tests/
│   └── welding.test.js
└── src/
    ├── app.js
    ├── controllers/
    │   └── welding.controller.js
    ├── routes/
    │   └── welding.routes.js
    └── services/
        └── weldingCalculator.service.js
```
