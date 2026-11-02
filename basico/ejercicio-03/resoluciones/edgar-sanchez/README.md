# Ejercicio 03 - módulos CommonJS

## Desarrollador

Edgar Manolo Polanco Sánchez

## Qué hace

Este proyecto Node.js utiliza la temática de MOBA esports para demostrar el uso de módulos CommonJS. El servicio `hero.service.js` elige un héroe y un rol para el equipo indicado, además de generar oro y un resultado KDA aleatorio.

`app.js` consume el servicio mediante `require()`, y el servicio expone su función mediante `module.exports`. El `package.json` no incluye `"type": "module"` para que Node.js interprete los archivos como CommonJS.

## Estructura

```text
basico/ejercicio-03/resoluciones/edgar-sanchez/
├── package.json
├── README.md
└── src/
    ├── app.js
    └── services/
        └── hero.service.js
```

## Requisitos

- Node.js 20 o superior.
- npm.

El proyecto no utiliza dependencias externas, por lo que no es necesario instalar paquetes adicionales. El comando `npm install` puede utilizarse para validar el proyecto local.

## Cómo ejecutar

```bash
cd basico/ejercicio-03/resoluciones/edgar-sanchez
npm install
npm start
```

Para indicar el nombre del equipo:

```bash
node src/app.js Dire
```

También puede utilizarse el script de desarrollo:

```bash
npm run dev
```

## Validación del caso de error

```bash
node -e "require('./src/services/hero.service').pickHero('')"
```

El comando debe lanzar el error `El nombre del equipo es obligatorio`.

## Salida de ejemplo

```text
Pick de heroe:
┌────────┬──────────┐
│ (index) │ Values   │
├────────┼──────────┤
│ equipo │ 'Dire'   │
│ heroe  │ 'Invoker'│
│ rol    │ 'Carry'  │
│ oro    │ 3200     │
│ kda    │ '4/1/7'  │
└────────┴──────────┘