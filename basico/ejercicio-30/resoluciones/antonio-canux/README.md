# Ejercicio 30 - Proyecto Integrador Básico (Motos y Mecánica)

**Alumno:** Antonio Canux  
**Tema:** Proyecto integrador de todo el nivel básico de Node.js y Express  
**Temática:** Motos y Taller Mecánico  
**Ruta Base:** http://localhost:3000/basico/ejercicio-30

---

## 📌 Enlaces Completos y Endpoints

| Método | Endpoint Completo | Descripción |
| :--- | :--- | :--- |
| `GET` | [http://localhost:3000/basico/ejercicio-30](http://localhost:3000/basico/ejercicio-30) | Estado del ejercicio integrador |
| `GET` | [http://localhost:3000/basico/ejercicio-30/motorcycles](http://localhost:3000/basico/ejercicio-30/motorcycles) | Listar motocicletas registradas |
| `GET` | [http://localhost:3000/basico/ejercicio-30/motorcycles/1](http://localhost:3000/basico/ejercicio-30/motorcycles/1) | Obtener motocicleta por ID |
| `POST` | [http://localhost:3000/basico/ejercicio-30/motorcycles](http://localhost:3000/basico/ejercicio-30/motorcycles) | Registrar nueva motocicleta en taller |
| `PUT` | [http://localhost:3000/basico/ejercicio-30/motorcycles/1](http://localhost:3000/basico/ejercicio-30/motorcycles/1) | Actualizar estado o diagnóstico |
| `DELETE` | [http://localhost:3000/basico/ejercicio-30/motorcycles/1](http://localhost:3000/basico/ejercicio-30/motorcycles/1) | Dar de baja motocicleta |

---

## 🚀 Guía de Instalación y Ejecución

```bash
npm install
npm run dev
```

---

## 🧪 Pruebas con cURL

```bash
# 1. Comprobar salud
curl http://localhost:3000/basico/ejercicio-30

# 2. Listar motos
curl http://localhost:3000/basico/ejercicio-30/motorcycles

# 3. Crear moto
curl -X POST http://localhost:3000/basico/ejercicio-30/motorcycles \
  -H "Content-Type: application/json" \
  -d '{"brand":"Yamaha","model":"MT-07","displacementCC":689,"serviceType":"Cambio de aceite","status":"En proceso"}'

# 4. Actualizar moto
curl -X PUT http://localhost:3000/basico/ejercicio-30/motorcycles/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"Completado"}'

# 5. Eliminar moto
curl -X DELETE http://localhost:3000/basico/ejercicio-30/motorcycles/1
```
