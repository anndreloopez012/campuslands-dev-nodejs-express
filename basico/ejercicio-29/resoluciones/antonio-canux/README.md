# Ejercicio 29 - README Técnico (Fútbol y Fútbol Sala)

**Alumno:** Antonio Canux  
**Tema:** Documentación técnica integral para APIs backend  
**Temática:** Equipos y Ligas de Fútbol / Fútbol Sala  
**Ruta Base:** http://localhost:3000/basico/ejercicio-29

---

## 📌 Enlaces Completos y Endpoints

| Método | Endpoint Completo | Descripción |
| :--- | :--- | :--- |
| `GET` | [http://localhost:3000/basico/ejercicio-29](http://localhost:3000/basico/ejercicio-29) | Estado general de la API |
| `GET` | [http://localhost:3000/basico/ejercicio-29/teams](http://localhost:3000/basico/ejercicio-29/teams) | Catálogo de equipos |
| `GET` | [http://localhost:3000/basico/ejercicio-29/teams/1](http://localhost:3000/basico/ejercicio-29/teams/1) | Búsqueda por ID |
| `POST` | [http://localhost:3000/basico/ejercicio-29/teams](http://localhost:3000/basico/ejercicio-29/teams) | Registro de nuevo equipo |

---

## 🚀 Guía de Instalación y Ejecución

```bash
npm install
npm run dev
```

---

## 🧪 Pruebas con cURL

```bash
# 1. Verificar estado
curl http://localhost:3000/basico/ejercicio-29

# 2. Listar equipos
curl http://localhost:3000/basico/ejercicio-29/teams

# 3. Obtener equipo por ID
curl http://localhost:3000/basico/ejercicio-29/teams/1

# 4. Registrar equipo
curl -X POST http://localhost:3000/basico/ejercicio-29/teams \
  -H "Content-Type: application/json" \
  -d '{"name":"Inter Movistar","category":"Fútbol Sala","city":"Madrid","founded":1977}'
```
