import { searchArtist } from '../services/music.service.js';

export const getStatus = (req, res) => {
    res.json({
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "promesas basicas"
    });
};

export const findMusic = (req, res) => {
    const { artist } = req.query;

    if (!artist) {
        return res.status(400).json({ 
            ok: false, 
            message: 'Debes proporcionar el nombre de un artista en la query string (?artist=nombre).' 
        });
    }

    // Consumo de la promesa con .then y .catch
    searchArtist(artist)
        .then((data) => {
            // Se ejecuta si el service llama a resolve()
            res.status(200).json({
                ok: true,
                data: data
            });
        })
        .catch((error) => {
            // Se ejecuta si el service llama a reject()
            res.status(404).json({
                ok: false,
                message: error.message
            });
        });
};