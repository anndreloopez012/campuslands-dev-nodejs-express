# Ejercicio 10 – Funciones Asíncronas

**Autor:** Anderson Oloroso  
**Tema:** Ping Pong 🏓

## Descripción

Simula un rally de ping pong usando callbacks y `setTimeout`. Demuestra el comportamiento no bloqueante de Node.js.

## Ejecución

```bash
npm start                    # Jugar con nombre por defecto
node src/app.js "Carlos"     # Jugar con nombre personalizado
```

## Casos de error

```bash
node src/app.js ""    # Nombre vacío
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    └── services/
        └── rally.service.js
```
