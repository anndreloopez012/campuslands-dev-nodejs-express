# Ejercicio 01 - Node runtime y consola

Practica de argumentos de consola usando solo Node.JS.

## Uso

Ubicarse en: 
```bash
basico/ejercicio-01/resoluciones/jakelin-quino/
```
El programa valida nombre, clase y nivel, y luego imprime una ficha de personaje RPG. Probar:
```bash
npm start
```
Resultado:
```bash
Uso: npm start -- <nombre> <clase> <nivel>
El nivel debe ser un numero entero mayor que cero.
```
 Para probar el error de validación:
```bash
npm start -- Ana maga 4
```
Resultado:

```bash
=== Ficha del aventurero ===
Nombre: Ana
Clase: maga
Nivel: 4
Estado: listo para la aventura
```
