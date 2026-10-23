# Ejercicio 06 - path y rutas seguras

Practica del modulo `path` usando solo Node.JS.

## Uso

Ubicarse en:
```bash
basico/ejercicio-06/resoluciones/jakelin-quino/
```

El programa construye una ruta dentro de la carpeta `data` y rechaza rutas que intenten salir de ella. Probar:
```bash
npm start
```
Resultado:
```bash
Directorio de datos: ...\\basico\\ejercicio-06\\resoluciones\\jakelin-quino\\data
Archivo seguro: ...\\basico\\ejercicio-06\\resoluciones\\jakelin-quino\\data\\motos.json
```

Para probar la validacion:
```bash
npm start -- ../package.json
```
Resultado:
```bash
Error: la ruta solicitada esta fuera de la carpeta permitida.
```