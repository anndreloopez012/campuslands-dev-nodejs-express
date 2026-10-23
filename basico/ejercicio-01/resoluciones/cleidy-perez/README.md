# Ejercicio 01 - Node runtime y consola

Solución sencilla con Node.js y JavaScript, sin Express ni dependencias externas. El programa muestra información del runtime de Node y una ficha de personaje RPG.

## Requisitos

- Node.js 20 o superior.

## Comandos

Desde la raíz del repositorio:

```bash
cd basico/ejercicio-01/resoluciones/cleidy-perez
npm install
npm start
```

También se puede ejecutar directamente:

```bash
node src/app.js
```

## Respuesta esperada de la consola

La versión, la plataforma, la arquitectura y el PID dependen del equipo. Una ejecución en Linux puede verse así:

```text
=== Ejercicio 01: Node runtime y consola ===
Node.js: v26.5.0
Plataforma: linux
Arquitectura: x64
PID: 42157

Personaje RPG:
┌─────────┬──────────────────────────┐
│ (index) │ Values                   │
├─────────┼──────────────────────────┤
│ name    │ 'Ariadna'                │
│ class   │ 'Exploradora'            │
│ level   │ 1                        │
│ status  │ 'Lista para la aventura' │
└─────────┴──────────────────────────┘

Ejercicio ejecutado correctamente.
```

## Estructura

```text
src/
└── app.js