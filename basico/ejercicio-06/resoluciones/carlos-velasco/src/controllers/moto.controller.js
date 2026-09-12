import { getMotoByFileName } from "../services/moto.service.js";

export const getMoto = async (req, res) => {
    try {
        const { fileName } = req.params;

        if (!fileName) {
            return res.status(400).json({
                ok: false,
                message: "Debes indicar el nombre del archivo"
            });
        }

        const moto = await getMotoByFileName(fileName);

        res.status(200).json({
            ok: true,
            data: moto
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            message: "No se encontró la ficha de la moto"
        });
    }
};