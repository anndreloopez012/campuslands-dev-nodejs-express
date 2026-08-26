# Ejercicio 01 - Node runtime y consola (Juan Lema)

## Que hace

Script Node.js tematica RPG que imprime info del runtime (version, plataforma, PID) y crea un personaje aleatorio, mostrandolo con `console.table`. Valida que el nombre no sea vacio y usa `console.error` + `process.exitCode` ante error.

## Como ejecutar

```bash
npm install
npm start
```

Opcional, pasar nombre por argumento (`process.argv`):

```bash
node src/app.js Lyra
```

## Como probar el caso de error

```bash
node -e "import('./src/services/character.service.js').then(m => m.createCharacter(''))"
```

Debe lanzar `Error: El nombre del personaje es obligatorio`.

## Estructura

```text
src/
├── app.js
└── services/
    └── character.service.js
```
