const fs = require("fs").promises;
const path = require("path");

const dataPath = path.join(__dirname, "../../data/fighters.json");

async function readFighters() {
  const data = await fs.readFile(dataPath, "utf-8");

  return JSON.parse(data);
}

async function writeFighters(fighters) {
  const data = JSON.stringify(fighters, null, 2);

  await fs.writeFile(dataPath, data, "utf-8");
}

async function getAllFighters() {
  return await readFighters();
}

async function getFighterById(id) {
  const fighters = await readFighters();

  return fighters.find((fighter) => fighter.id === id);
}

async function createFighter(fighterData) {
  const fighters = await readFighters();

  const newId =
    fighters.length > 0
      ? Math.max(...fighters.map((fighter) => fighter.id)) + 1
      : 1;

  const newFighter = {
    id: newId,
    ...fighterData
  };

  fighters.push(newFighter);

  await writeFighters(fighters);

  return newFighter;
}

async function updateFighter(id, fighterData) {
  const fighters = await readFighters();

  const index = fighters.findIndex((fighter) => fighter.id === id);

  if (index === -1) {
    return null;
  }

  fighters[index] = {
    ...fighters[index],
    ...fighterData,
    id
  };

  await writeFighters(fighters);

  return fighters[index];
}

async function deleteFighter(id) {
  const fighters = await readFighters();

  const index = fighters.findIndex((fighter) => fighter.id === id);

  if (index === -1) {
    return null;
  }

  const deletedFighter = fighters[index];

  fighters.splice(index, 1);

  await writeFighters(fighters);

  return deletedFighter;
}

module.exports = {
  getAllFighters,
  getFighterById,
  createFighter,
  updateFighter,
  deleteFighter
};