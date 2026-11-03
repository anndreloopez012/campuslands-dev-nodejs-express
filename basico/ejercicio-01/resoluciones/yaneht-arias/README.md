# Ejercicio 01 - Tiradas de dados RPG

Solución sencilla de consola con Node.js y JavaScript, sin Express ni dependencias externas. El programa recibe la cantidad de dados y la cantidad de caras, genera las tiradas y muestra el total.

## Requisitos

- Node.js 20 o superior.

## Comandos para ejecutarlo

Desde la raíz del repositorio:

```bash
cd basico/ejercicio-01/resoluciones/yaneht-arias
npm start -- 3 6
```

También puede ejecutarse directamente:

```bash
node src/app.js 2 20
```

Sin argumentos, el programa usa 2 dados de 6 caras:

```bash
npm start
```

No es necesario ejecutar `npm install` porque el proyecto no tiene dependencias.

## Argumentos

- Cantidad de dados: un número entero mayor que 0.
- Caras por dado: un número entero mayor que 1.

## Resultado en consola

Las tiradas son aleatorias, por lo que los números cambian en cada ejecución. Una ejecución de `npm start -- 3 6` se ve así:

```text
> ejercicio-01-yaneht-arias@1.0.0 start
> node src/app.js 3 6

=== Tiradas de dados RPG ===
Dados: 3 de 6 caras
Resultados: [ 3, 1, 6 ]
Total: 10
```

## Estructura

```text
yaneht-arias/
├── package.json
├── README.md
└── src/
    └── app.js
```

La solución utiliza solamente JavaScript y los módulos nativos de Node.js.
