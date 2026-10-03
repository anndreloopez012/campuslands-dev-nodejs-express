import { envs } from '../config/envs.js';

// Base de datos en memoria para el ejercicio
const hypercars = [
    { id: 1, brand: 'Koenigsegg', model: 'Jesko Absolut', topSpeed: 531 },
    { id: 2, brand: 'Bugatti', model: 'Bolide', topSpeed: 500 },
    { id: 3, brand: 'Pagani', model: 'Huayra R', topSpeed: 383 },
    { id: 4, brand: 'McLaren', model: 'Speedtail', topSpeed: 402 }
];

export const getStatus = (req, res) => {
    // Respuesta requerida en las instrucciones base
    res.json({
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "variables de entorno"
    });
};

export const getHypercars = (req, res) => {
    // 1. Usamos una variable de entorno para simular seguridad
    const clientApiKey = req.headers['x-api-key'];
    
    if (envs.NODE_ENV === 'production' && clientApiKey !== envs.API_KEY) {
        return res.status(401).json({ 
            ok: false, 
            message: 'Acceso denegado. API Key inválida para el entorno de producción.' 
        });
    }

    // 2. Usamos otra variable de entorno para filtrar datos
    const filteredCars = hypercars.filter(car => car.topSpeed >= envs.SPEED_LIMIT_FILTER);

    res.json({
        ok: true,
        environment: envs.NODE_ENV,
        speedFilterApplied: envs.SPEED_LIMIT_FILTER,
        data: filteredCars
    });
};