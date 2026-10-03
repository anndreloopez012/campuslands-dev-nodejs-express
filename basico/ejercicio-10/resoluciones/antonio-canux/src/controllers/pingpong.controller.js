import { simulateMatch } from '../services/pingpong.service.js';

export const getStatus = (req, res) => {
    res.json({
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "funciones asincronas"
    });
};

export const playPingPongMatch = async (req, res) => {
    try {
        const { player1, player2 } = req.body;

        // 1. Validación básica
        if (!player1 || !player2) {
            return res.status(400).json({ 
                ok: false, 
                message: 'Se requieren player1 y player2 para jugar.' 
            });
        }

        // 2. Aquí está la magia: AWAIT detiene la ejecución de esta función
        // hasta que el servicio termine de "calcular", sin bloquear Express.
        const result = await simulateMatch(player1, player2);

        // 3. Retornamos la respuesta exitosa
        res.status(200).json({
            ok: true,
            message: "¡Partido finalizado!",
            data: result
        });

    } catch (error) {
        // Manejo de errores asíncronos
        res.status(500).json({ 
            ok: false, 
            message: 'Hubo un error al simular el partido.' 
        });
    }
};