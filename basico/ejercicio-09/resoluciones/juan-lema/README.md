# Ejercicio 09 - JSON y persistencia simple (Juan Lema)

## Que hace

Tematica kickboxing. `fighters.service.js` lee/escribe `data/fighters.json` con `fs/promises` (`readFile`/`writeFile`): `listFighters` lista, `addFighter` valida, agrega y persiste un nuevo peleador.

## Como ejecutar

```bash
npm install
npm start
```

Agregar un peleador (persiste en el JSON):

```bash
node src/app.js "Luz Ferreira" 63
```

## Como probar el caso de error

```bash
node src/app.js "Luz Ferreira"
```

Debe imprimir `Error de persistencia: El peso debe ser un numero mayor a 0`.

## Estructura

```text
src/
├── app.js
├── data/
│   └── fighters.json
└── services/
    └── fighters.service.js
```
