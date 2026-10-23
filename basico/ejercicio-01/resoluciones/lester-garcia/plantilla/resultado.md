# RPG Backend - Ejercicio 01

## Descripción

Este proyecto consiste en una pequeña solución backend desarrollada con **Node.js** y **Express**, utilizando como temática un videojuego RPG.

El objetivo principal del ejercicio es practicar los conceptos fundamentales de un backend, comenzando desde el uso de Node.js y la consola hasta la creación de una API sencilla con rutas, controladores y servicios.

La aplicación representa información básica de un personaje de RPG llamado **El último guerrero**.

---

## Objetivos del ejercicio

Durante el desarrollo se practicaron los siguientes conceptos:

- Uso de Node.js como runtime.
- Uso de npm para gestionar dependencias.
- Instalación y utilización de Express.
- Creación de un servidor HTTP.
- Creación de rutas mediante Express.
- Respuestas en formato JSON.
- Separación de responsabilidades.
- Organización del código mediante:
  - Rutas.
  - Controladores.
  - Servicios.
- Pruebas de las rutas mediante el navegador.
- Documentación básica de un proyecto backend.

---

## Tecnologías utilizadas

- **Node.js**
- **Express**
- **JavaScript**
- **npm**

---

## Estructura del proyecto

```text
src/
├── controllers/
│   └── personajeController.js
│
├── routes/
│   └── personajeRoutes.js
│
├── services/
│   └── personajeService.js
│
├── index.js
├── package.json
├── package-lock.json
├── resultado.md
└── README.md