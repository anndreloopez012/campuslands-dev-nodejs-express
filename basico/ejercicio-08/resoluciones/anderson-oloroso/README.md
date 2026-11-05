# Básico - Ejercicio 08: Variables de Entorno
> **Autor:** Anderson Oloroso  
> **Temática:** Hiperdeportivos  
> **Tema:** variables de entorno  

---

## Descripción del ejercicio

Demuestra el acceso, tipado, validación y asignación de valores por defecto (fallback seguro) a las variables de entorno con `process.env`. Incluye archivo `.env.example` de referencia sin exponer credenciales sensibles.

---

## Cómo ejecutar

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar con valores por defecto:
   ```bash
   npm start
   ```

3. Ejecutar pasando variables de entorno en la terminal (ejemplo en PowerShell o Bash):
   - **PowerShell:**
     ```powershell
     $env:PORT="5000"; $env:TELEMETRY_PISTA="Silverstone"; node src/app.js
     ```
   - **Bash:**
     ```bash
     PORT=5000 TELEMETRY_PISTA="Silverstone" node src/app.js
     ```

---

## Estructura de la entrega

```text
basico/ejercicio-08/resoluciones/anderson-oloroso/
├── .env.example
├── package.json
├── README.md
└── src/
    ├── app.js
    └── config/
        └── env.js
```
