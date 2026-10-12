import  fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/matches.json");

export const findAllMatches = async ()=>{
    const data = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(data);

};

export const findMatchById = async (id)=>{
    const matches = await findAllMatches();
    return matches.find((m)=>m.id === String(id)) || null;
};

export const saveMatch = async (matchData) => {
    const matches = await findAllMatches();
    matches.push(matchData);
    await fs.writeFile(DATA_PATH, JSON.stringify(matches, null, 2), "utf-8");
};