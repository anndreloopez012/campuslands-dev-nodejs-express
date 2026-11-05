# Ejercicio 09 – JSON y Persistencia Simple

**Autor:** Anderson Oloroso  
**Tema:** Kickboxing 🥊

## Descripción

Gestión de peleadores de kickboxing con persistencia en archivo JSON. Permite listar y agregar peleadores.

## Ejecución

```bash
npm start                          # Listar peleadores
node src/app.js "Anderson Silva" 84  # Agregar peleador
```

## Casos de error

```bash
node src/app.js "" 80       # Nombre vacío
node src/app.js "Test" -5   # Peso inválido
node src/app.js "Solo"      # Argumentos incompletos
```

## Estructura

```
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── data/
    │   └── fighters.json
    └── services/
        └── fighters.service.js
```
