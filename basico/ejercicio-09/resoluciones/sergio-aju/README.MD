# BASICO 09 - JSON y persistencia simple

## Descripción

Ejercicio básico para practicar lectura y escritura de archivos JSON con Node.js.

Se utiliza un archivo para guardar información de peleadores de kickboxing.

## Ejecutar

Listar peleadores:

```bash
npm start -- listar
```

Agregar un peleador:

```bash
npm start -- agregar "Carlos" "Kickboxing"
```

## Persistencia

Los datos se guardan en:

```text
data/peleadores.json
```

Se utilizan `readFile()` para leer y `writeFile()` para guardar.

## Estructura

```text
data/
└── peleadores.json

src/
└── app.js
```
