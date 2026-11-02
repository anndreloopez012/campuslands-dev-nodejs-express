import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas absolutas en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.join(__dirname, '../data/fighters.json');

// Función auxiliar para leer el JSON
const readData = async () => {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe o está vacío, devolvemos un arreglo vacío
        return [];
    }
};

// Función auxiliar para guardar en el JSON
const writeData = async (data) => {
    // JSON.stringify con 'null, 2' lo formatea con saltos de línea para que sea legible
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

export const getFighters = async () => {
    return await readData();
};

export const addFighter = async (fighterData) => {
    const fighters = await readData();
    
    const newFighter = {
        id: Date.now(), // ID único basado en el timestamp actual
        name: fighterData.name,
        category: fighterData.category,
        record: fighterData.record || '0-0-0'
    };

    fighters.push(newFighter);
    await writeData(fighters);
    
    return newFighter;
};