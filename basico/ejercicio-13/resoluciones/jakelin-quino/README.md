# Ejercicio 13 - manejo de errores

Practica de errores personalizados y bloques `try/catch` usando solo Node.JS.

## Uso

Ubicarse en:
```bash
basico/ejercicio-13/resoluciones/jakelin-quino/
```

El programa consulta misiones de ciencia ficcion y maneja un codigo de mision inexistente. Probar:
```bash
npm start -- ORION-7
```
Resultado:
```bash
ORION-7: Explorar el planeta Kepler
```

Para probar el error esperado:
```bash
npm start -- DESCONOCIDA-1
```
Resultado:
```bash
Error de mision: La mision DESCONOCIDA-1 no existe.
```