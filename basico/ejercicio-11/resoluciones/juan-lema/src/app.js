import { playTrack } from "./services/playlist.service.js";

function main() {
  const trackArg = process.argv.length > 2 ? process.argv[2] : "Bohemian Rhapsody";

  console.log("Cargando cancion...");

  playTrack(trackArg)
    .then((result) => {
      console.log("Reproduciendo:");
      console.table(result);
    })
    .catch((error) => {
      console.error(`Error al reproducir: ${error.message}`);
      process.exitCode = 1;
    });
}

main();
