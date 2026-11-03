import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/teams.json");

export const getTeamsFromFileService = async (categoryFilter) => {
  const fileData = await fs.readFile(DATA_PATH, "utf-8");
  const teams = JSON.parse(fileData);

  if (categoryFilter) {
    return teams.filter(
      (team) => team.category.toLowerCase() === categoryFilter.toLowerCase()
    );
  }

  return teams;
};