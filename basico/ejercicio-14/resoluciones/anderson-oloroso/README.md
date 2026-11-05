# Ejercicio 14 – Validación de Entrada

**Autor:** Anderson Oloroso  
**Tema:** Libros 📚

## Descripción

Valida datos de un libro acumulando TODOS los errores (no solo el primero). Verifica título, autor, páginas y año.

## Ejecución

```bash
node src/app.js "Dune" "Frank Herbert" 412 1965         # Libro válido
node src/app.js "1984" "George Orwell" 328 1949          # Otro libro válido
```

## Casos de error

```bash
node src/app.js "" "" -5 3000                            # Múltiples errores
node src/app.js "" "Autor" 100 2020                      # Solo título vacío
node src/app.js "Libro" "Autor" abc 2020                 # Páginas no numéricas
node src/app.js "Libro" "Autor" 100 999                  # Año fuera de rango
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    └── services/
        └── book-validator.service.js
```
