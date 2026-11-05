# Básico - Ejercicio 05
Creador: Anderson Oloroso

## Descripción

Solución para el ejercicio de **fs para leer archivos** con temática de **fútbol y fútbol sala** implementada con **ECMAScript Modules (ESM)**.

Demuestra:
- Uso del módulo nativo asíncrono `node:fs/promises` y su método `readFile`.
- Construcción de rutas absolutas y seguras mediante `node:path` y `fileURLToPath(import.meta.url)`.
- Lectura y deserialización de un archivo de datos local (`data/players.json`) mediante `JSON.parse()`.
- Búsqueda de registros por identificador con validación de tipo (debe ser un entero positivo) y verificación de existencia.
- Separación de responsabilidades entre el servicio de datos (`src/service/players.service.js`) y la interfaz de consola (`src/app.js`).

---

## Cómo ejecutar

1. **Instalar dependencias:**
   *(Este ejercicio utiliza módulos internos de Node.js, no requiere librerías externas).*
   ```bash
   npm install
   ```

2. **Ejecutar el script principal (busca el jugador ID 2 por defecto):**
   ```bash
   npm start
   ```

3. **Ejecutar en modo observador (watch con Node.js buscando el jugador ID 3):**
   ```bash
   npm run dev
   ```

4. **Ejecutar pasando un ID de jugador específico por consola:**
   ```bash
   node src/app.js 1
   ```

---

## Cómo probar los casos de error (Validación)

### 1. Jugador no encontrado
Si buscas un ID que no existe en el archivo JSON:
```bash
node src/app.js 99
```
**Salida esperada:**
```text
[ERROR]:  Jugador con id 99 no encontrado
```

### 2. ID inválido (no numérico / no entero positivo)
Si pruebas directamente la función del servicio con un argumento inválido:
```bash
node -e "import('./src/service/players.service.js').then(m => m.getPlayerById('abc'))"
```
**Salida esperada:**
```text
Error: El id del jugador debe ser un numero entero positivo
```

---

## Estructura de la entrega

```text
basico/ejercicio-05/resoluciones/anderson-oloroso/
├── data/
│   └── players.json
├── package.json
├── README.md
└── src/
    ├── app.js
    └── service/
        └── players.service.js
```
