import { readFile } from "node:fs/promises";

async function main() {
  const packagePath = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));

  console.log(`${packageJson.name} v${packageJson.version}`);
  console.log("Scripts disponibles:");
  console.table(packageJson.scripts);
}

main().catch((error) => {
  console.error(`Error leyendo package.json: ${error.message}`);
  process.exitCode = 1;
});