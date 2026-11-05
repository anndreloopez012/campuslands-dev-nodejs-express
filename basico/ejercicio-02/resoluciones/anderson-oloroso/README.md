# Básico - Ejercicio 02: npm scripts y package.json
> **Autor:** Anderson Oloroso  
> **Temática:** Shooters competitivos  
> **Tema:** npm scripts y package.json  

---

## Descripción del ejercicio

Solución para el ejercicio de **npm scripts y package.json** con temática de shooters competitivos implementado con **ECMAScript Modules (ESM)** nativos.

El proyecto demuestra:
- Configuración y propósito de scripts útiles dentro del archivo `package.json` (`start`, `dev`, `info`, `match`).
- Uso del estándar nativo ESM con `"type": "module"`.
- Importaciones nativas de Node.js mediante el prefijo `node:` (`node:fs`, `node:path`, `node:url`).
- Lectura síncrona y parsing de metadatos de configuración JSON.
- Simulación de estadísticas de partida competitiva (`kills`, `deaths`, K/D ratio, mapa y arma).
- Validación de datos de entrada vía CLI (`process.argv`) y manejo de excepciones con código de salida `process.exitCode = 1`.

---

## Cómo ejecutar

1. **Instalar dependencias:**  
   *(Este ejercicio utiliza módulos internos de Node.js sin requerir dependencias externas).*
   ```bash
   npm install
   ```

2. **Ejecutar el script principal (jugador por defecto):**
   ```bash
   npm start
   ```

3. **Ejecutar en modo observador con recarga automática:**
   ```bash
   npm run dev
   ```

4. **Consultar metadatos e inspección de scripts del package.json:**
   ```bash
   npm run info
   ```

5. **Ejecutar pasando un nombre de jugador personalizado por consola:**
   ```bash
   node src/app.js "Viper"
   ```

---

## Cómo probar el caso de error (Validación)

Para verificar que la validación responde correctamente lanzando un error cuando el nombre del jugador no es válido o está vacío:

```bash
node -e "import('./src/app.js').then(m => m.simulateMatch(''))"
```

**Salida esperada:**
```text
Error: El nombre del jugador es obligatorio para iniciar una partida.
```

---

## Estructura de la entrega

```text
basico/ejercicio-02/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    └── app.js
```
