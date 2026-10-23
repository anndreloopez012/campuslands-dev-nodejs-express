const fs = require("fs/promises");
const path = require("path");

const filePath = path.join(__dirname, "../../data/teams.json");

async function getTeams() {
  const fileContent = await fs.readFile(filePath, "utf-8");

  const teams = JSON.parse(fileContent);

  return teams;
}

module.exports = {
  getTeams
};