# Básico - Ejercicio 06: Path y Rutas Seguras
> **Autor:** Anderson Oloroso  
> **Temática:** Motos y mecánica  
> **Tema:** path y rutas seguras  

---

## Descripción del ejercicio

Demuestra el uso del módulo nativo `node:path` para gestionar rutas de archivos de manera multiplataforma y segura, protegiendo el servidor contra ataques de **Directory Traversal** (`../`).

- Uso de `path.resolve`, `path.join`, `path.basename` y `path.extname`.
- Validación estricta para garantizar que las consultas no salgan del directorio base permitido (`src/data/manuales`).

---

## Cómo ejecutar

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar manual por defecto:
   ```bash
   npm start
   ```

3. Consultar manual específico:
   ```bash
   node src/app.js yamaha-mt09.txt
   ```

4. Probar caso de ataque de Path Traversal (Error esperado):
   ```bash
   node src/app.js "../../package.json"
   ```
   **Salida esperada:**
   ```text
   [ERROR DE SEGURIDAD/SISTEMA]: Acceso no autorizado: Intento de evasión de directorio detectado (Directory Traversal).
   ```

---

## Estructura de la entrega

```text
basico/ejercicio-06/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── data/
    │   └── manuales/
    │       └── yamaha-mt09.txt
    └── services/
        └── manual.service.js
```
