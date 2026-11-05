# Básico - Ejercicio 07: process.argv y CLI
> **Autor:** Anderson Oloroso  
> **Temática:** Autos de lujo  
> **Tema:** process.argv y CLI  

---

## Descripción del ejercicio

Implementación de una herramienta de línea de comandos (CLI) en **Node.js** que procesa argumentos directos mediante `process.argv` y extrae banderas con valores para filtrar inventarios de autos de lujo.

---

## Cómo ejecutar

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar con filtro por marca:
   ```bash
   npm start
   ```

3. Ver opciones de ayuda:
   ```bash
   npm run help
   ```

4. Consultar con argumentos personalizados (por ejemplo autos con precio menor o igual a 300,000 USD):
   ```bash
   node src/app.js --maxPrice 300000
   ```

5. Combinar filtros:
   ```bash
   node src/app.js --brand Ferrari --minPrice 300000
   ```

---

## Estructura de la entrega

```text
basico/ejercicio-07/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    └── services/
        └── carsCli.service.js
```
