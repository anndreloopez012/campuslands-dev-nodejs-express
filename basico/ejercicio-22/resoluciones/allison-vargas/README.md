# Basico 22 - servicios simples 

## Que hace este ejercicio

Administra modelos de arquitectura 3D y calcula su costo estimado por
material y area. El foco esta en src/services/modelos.service.js:

- calcularCostoEstimado(areaM2, material) es una funcion pura: no
  sabe nada de HTTP, no lee archivos, solo recibe numeros y devuelve un
  numero. Se puede probar sola, sin levantar ningun servidor.
- Esa misma funcion se reutiliza en tres lugares: al listar modelos, al
  crear uno nuevo, y al armar el resumen (GET /modelos/resumen).
- El costo NO esta guardado en modelos.json: se calcula cada vez que
  se pide, a partir del material y el area.

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- routes/
    |   `-- ejercicio.routes.js
    |-- controllers/
    |   `-- ejercicio.controller.js
    |-- services/
    |   `-- modelos.service.js
    |-- validators/
    |   `-- modelo.validator.js
    `-- data/
        `-- modelos.json
```

## Como ejecutar

```bash
cd basico/ejercicio-22/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-22:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "servicios simples"
}
```

## Ejemplos

```bash
# listar (con costo calculado)
curl http://localhost:3000/basico/ejercicio-22/modelos

# resumen (usa el mismo calculo, agregado)
curl http://localhost:3000/basico/ejercicio-22/modelos/resumen

# ver uno
curl http://localhost:3000/basico/ejercicio-22/modelos/1

# crear -> 201, con costo_estimado_usd calculado automaticamente
curl -X POST http://localhost:3000/basico/ejercicio-22/modelos -H "Content-Type: application/json" -d "{\"nombre\":\"Puente Modular\",\"area_m2\":210,\"material\":\"acero\"}"

# material invalido -> 400
curl -X POST http://localhost:3000/basico/ejercicio-22/modelos -H "Content-Type: application/json" -d "{\"nombre\":\"Test\",\"area_m2\":100,\"material\":\"papel\"}"
```
