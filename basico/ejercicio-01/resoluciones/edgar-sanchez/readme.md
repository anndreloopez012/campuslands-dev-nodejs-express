reset # Ejercicio 01 - Node runtime y consola
## Desarrolador:
*Edgar Manolo Polanco Sánchez*

### Que hace

Script Node.js con tematica RPG que imprime informacion del runtime (version de Node,
plataforma, PID) y luego registra una expedicion: recibe una distancia, mide el tiempo
de calculo con `process.hrtime.bigint()` y devuelve el estado de la expedicion
(`sendero seguro`, `zona peligrosa` o `territorio legendario`) segun la distancia.

Si la distancia no es un numero mayor a 0, lanza un error y el proceso termina con
`process.exitCode = 1`.

## Como ejecutar

```bash
npm install
npm start
```
