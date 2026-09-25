# Ejercicio 08: variables de entorno

CLI mínima que lee configuración desde `process.env` y muestra un hiperdeportivo en JSON. No usa Express, dependencias externas ni valores secretos.

## Ejecutar

```bash
npm install
npm start
HYPERCAR_MODEL="Vortex GT" HYPERCAR_YEAR=2024 HYPERCAR_PRICE=320000 npm start
```

Valores predeterminados: `Apex R`, `2025` y `250000`.

## Variables

- `HYPERCAR_MODEL`: nombre del vehículo.
- `HYPERCAR_YEAR`: año entero entre `2000` y `2100`.
- `HYPERCAR_PRICE`: precio numérico mayor que `0`.

## Errores

Un modelo vacío, un año inválido o un precio no positivo terminan con código `1` y un mensaje explicativo.
