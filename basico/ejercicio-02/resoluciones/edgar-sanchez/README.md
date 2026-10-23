# Ejercicio 02 - npm scripts y package.json

## Desarrollador

Edgar Manolo Polanco Sánchez

## Qué hace

Este proyecto Node.js usa la temática de shooters competitivos para demostrar el uso de `package.json` y los scripts de npm. Al ejecutarlo, asigna un loadout aleatorio a un jugador y muestra el arma, mapa, munición y armadura mediante `console.table()`.

El nombre del jugador se puede enviar como argumento. Si no se proporciona, se usa `Operador`. Un nombre vacío genera un error y termina el proceso con código 1.

También incluye el script `info`, que lee el `package.json` del proyecto y muestra su nombre, versión y scripts disponibles.

## Estructura

```text
basico/ejercicio-02/resoluciones/edgar-sanchez/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── info.js
    └── services/
        └── loadout.service.js
```

## Requisitos

- Node.js 20 o superior.
- npm.

El proyecto no tiene dependencias externas, por lo que no es necesario instalar paquetes adicionales. Si se ejecuta `npm install`, npm solo validará el proyecto local.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm start` | Genera un loadout para el operador predeterminado. |
| `npm run dev` | Ejecuta la aplicación con recarga automática de Node.js. |
| `npm run info` | Muestra la información y los scripts definidos en `package.json`. |

## Cómo ejecutar

```bash
cd basico/ejercicio-02/resoluciones/edgar-sanchez
npm start
```

Para indicar el nombre del jugador:

```bash
npm start -- "Commander"
```

Para consultar los scripts del proyecto:

```bash
npm run info
```

Para iniciar el modo de desarrollo:

```bash
npm run dev
```

## Validación de errores

```bash
npm start -- ""
```

El comando anterior debe mostrar un mensaje de error y terminar con código de salida 1.

## Paquete de ejemplo

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "npm scripts y package.json"
}