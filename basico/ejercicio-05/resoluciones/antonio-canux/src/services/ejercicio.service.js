const fs = require('fs/promises');
const path = require('path');

const ejecutarEjercicio = async () => {
    console.log("[VAR] 📺 Revisando el registro del partido en la base de datos local...");
    
    // Construimos la ruta absoluta al archivo JSON
    const filePath = path.join(__dirname, '../data/partido.json');
    
    // Leemos el archivo asíncronamente
    const dataRaw = await fs.readFile(filePath, 'utf-8');
    
    // Convertimos el texto leído a un objeto de JavaScript
    const partidoData = JSON.parse(dataRaw);

    return {
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "fs para leer archivos",
        futbol_context: partidoData
    };
};

module.exports = {
    ejecutarEjercicio
};