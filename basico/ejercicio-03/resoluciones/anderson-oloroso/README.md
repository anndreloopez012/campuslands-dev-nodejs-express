# Básico - Ejercicio 03: Módulos CommonJS
> **Autor:** Anderson Oloroso  
> **Temática:** MOBA esports  
> **Tema:** Módulos CommonJS  

---

## Descripción del ejercicio

Solución para el ejercicio de **módulos CommonJS** con temática de **MOBA esports**. 

El proyecto demuestra:
- Uso del sistema de módulos clásico de Node.js mediante `module.exports` y `require()`.
- Separación de responsabilidades: la lógica del draft y catálogo de héroes vive en `src/service/app.service.js` y el punto de entrada ejecutable en `src/app.js`.
- Configuración de `package.json` con `"type": "commonjs"`.
- Procesamiento de argumentos de línea de comandos mediante `process.argv` con valor por defecto.
- Validación de entrada y control de excepciones estructuradas.

---

## Cómo ejecutar

1. **Instalar dependencias:**  
   *(Este ejercicio utiliza módulos internos de Node.js, no requiere librerías externas).*
   ```bash
   npm install
   ```

2. **Ejecutar el script principal (con equipo por defecto):**
   ```bash
   npm start
   ```

3. **Ejecutar en modo desarrollo con recarga automática:**
   ```bash
   npm run dev
   ```

4. **Ejecutar pasando un equipo personalizado por consola:**
   ```bash
   node src/app.js "Cloud9"
   ```

---

## Cómo probar el caso de error (Validación)

Para verificar que el servicio valida correctamente el nombre del equipo y lanza la excepción esperada cuando se pasa una cadena vacía:

```bash
node -e "require('./src/service/app.service.js').getChampion('')"
```

**Salida esperada:**
```text
Error: Nombre de equipo requerido
```

---

## Estructura de la entrega

```text
basico/ejercicio-03/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    └── service/
        └── app.service.js
```
