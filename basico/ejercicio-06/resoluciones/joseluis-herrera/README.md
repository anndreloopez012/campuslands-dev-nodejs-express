# Ejercicio - Manejo seguro de rutas
Ejercicio de Node.js para practicar el manejo de rutas con `path` y validar que los archivos solicitados se encuentren dentro de una carpeta permitida.

## Estructura
```text
├── data/
│   └── motos.json
├── src/
│   └── app.js
└── package.json
```

## Ejecución

```bash
npm start
```

También se puede indicar un archivo:

```bash
node src/app.js motos.json
```

El programa valida la ruta solicitada para evitar acceder a archivos fuera de la carpeta `data`.
