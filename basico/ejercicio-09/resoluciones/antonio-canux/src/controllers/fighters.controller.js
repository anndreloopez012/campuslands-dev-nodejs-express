import { getFighters, addFighter } from '../services/fighters.service.js';

export const getStatus = (req, res) => {
    res.json({
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "JSON y persistencia simple"
    });
};

export const listFighters = async (req, res) => {
    try {
        const fighters = await getFighters();
        res.json({ ok: true, data: fighters });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al leer los datos.' });
    }
};

export const createFighter = async (req, res) => {
    try {
        const { name, category, record } = req.body;

        // Validación básica
        if (!name || !category) {
            return res.status(400).json({ 
                ok: false, 
                message: 'El nombre y la categoría son obligatorios.' 
            });
        }

        const newFighter = await addFighter({ name, category, record });
        res.status(201).json({ ok: true, data: newFighter });
        
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al guardar el dato.' });
    }
};