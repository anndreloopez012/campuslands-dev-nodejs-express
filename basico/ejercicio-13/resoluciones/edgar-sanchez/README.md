# Ejercicio 13: manejo de errores

CLI mínima para buscar una misión de ciencia ficción. El servicio define un error de dominio con código y la aplicación lo convierte en una respuesta JSON controlada. No usa Express ni dependencias externas.

## Ejecutar

```bash
npm install
npm start
npm start -- "desconocida"
```

Sin argumentos busca `Odisea`. Los errores incluyen `name`, `code` y `message`.

## Estructura

- `src/app.js`: captura y serialización de errores.
- `src/services/mission.service.js`: `MissionError` y validaciones de dominio.

## Errores

Un nombre vacío produce `INVALID_NAME` y `desconocida` produce `MISSION_NOT_FOUND`; ambos terminan con código `1`.
