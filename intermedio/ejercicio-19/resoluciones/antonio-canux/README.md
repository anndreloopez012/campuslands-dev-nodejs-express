# Ejercicio 019: dotenv y Config

- **Camper:** Antonio Canux
- **Nivel:** Intermedio
- **Tema:** dotenv y Config (tatuajes)

## Estructura de Carpetas

```text
intermedio/ejercicio-19/resoluciones/antonio-canux/
├── .example.env
├── README.md
├── package.json
├── src/app.js
├── src/config/env.js
├── src/controllers/studios.controller.js
├── src/data/studios.data.js
├── src/routes/studios.routes.js
└── src/server.js
```

## Cómo funciona

- `src/config/env.js` carga `.env` con `dotenv`, aplica valores por defecto y valida `API_KEY`.
- El archivo `.env` no se sube (está en `.gitignore`); se documenta con `.example.env`.

## Ejecución

Copia `.example.env` a `.env` antes de iniciar (`cp .example.env .env` o `copy .example.env .env`).

```bash
npm install
npm run dev
```

## Pruebas con cURL

```bash
# Endpoint del ejercicio
curl http://localhost:3000/intermedio/ejercicio-19

# Listar estudios
curl http://localhost:3000/api/studios

# Ver config (secretos ocultos)
curl http://localhost:3000/api/studios/config
```
