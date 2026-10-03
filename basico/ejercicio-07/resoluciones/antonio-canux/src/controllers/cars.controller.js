import { getCars } from '../services/cars.service.js';

export const getStatus = (req, res) => {
    // Respuesta exacta requerida en las instrucciones
    res.json({
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "process.argv y CLI"
    });
};

export const listCarsAPI = (req, res) => {
    res.json({
        ok: true,
        data: getCars()
    });
};