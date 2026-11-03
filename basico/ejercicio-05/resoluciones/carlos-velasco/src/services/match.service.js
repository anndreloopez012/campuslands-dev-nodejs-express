import { readFile } from "node:fs/promises";

const filePath = new URL("../data/matches.json", import.meta.url);

export const getMatches = async () => {
    const content = await readFile(filePath, "utf-8");

    return JSON.parse(content);
};