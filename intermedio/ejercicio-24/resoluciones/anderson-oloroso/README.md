# Intermedio - Ejercicio 24: Testing de Servicios
> **Autor:** Anderson Oloroso | **Temática:** Fórmulas químicas | **Tema:** Testing de servicios

## Descripción
Enfocado en el diseño de pruebas unitarias exhaustivas para la capa de servicios (`chemistry.service.js`), aislando la lógica de negocio de los controladores y del protocolo HTTP.

## Instalación y ejecución
```bash
cd intermedio/ejercicio-24/resoluciones/anderson-oloroso
npm install
npm test       # Ejecuta tests con el runner nativo de Node.js
npm start      # Inicia el servidor
```

## Estructura
```text
intermedio/ejercicio-24/resoluciones/anderson-oloroso/
├── package.json
├── README.md
├── tests/
│   └── chemistry.test.js
└── src/
    ├── app.js
    ├── controllers/
    │   └── chemistry.controller.js
    ├── routes/
    │   └── chemistry.routes.js
    └── services/
        └── chemistry.service.js
```
