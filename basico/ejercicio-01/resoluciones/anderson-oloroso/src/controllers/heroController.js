const heroService = require('../services/heroService');

const obtenerEstado = (req, res) => {
    const runtime = heroService.getRuntimeInfo();
    console.log(`[INFO] GET status - Proceso PID ${runtime.pid} en ${runtime.platform}`);

    return res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'Node runtime y consola',
        runtime
    });
};

const checkHero = (req, res) => {
    const { nombre, rol, hp } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({
            ok: false,
            message: 'El nombre del héroe es requerido y debe ser una cadena no vacía.'
        });
    }

    if (!rol || typeof rol !== 'string' || rol.trim() === '') {
        return res.status(400).json({
            ok: false,
            message: 'El rol o clase del héroe es requerido (Guerrero, Mago, Arquero, etc.).'
        });
    }

    if (hp === undefined || typeof hp !== 'number' || isNaN(hp)) {
        return res.status(400).json({
            ok: false,
            message: 'Los puntos de vida (hp) son requeridos y deben ser un número.'
        });
    }

    const data = heroService.checkHero(nombre.trim(), rol.trim(), hp);

    return res.status(200).json({
        ok: true,
        message: 'Héroe evaluado satisfactoriamente',
        data
    });
};

module.exports = {
    obtenerEstado,
    checkHero
};
