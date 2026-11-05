import { playTrack } from "./services/playlist.service.js";

const trackName = process.argv[2] || "Bohemian";

console.log(`\n🎵 Buscando track: "${trackName}"...\n`);

playTrack(trackName)
  .then((track) => {
    console.log("🎶 ¡Track encontrado!");
    console.log(`  Nombre:   ${track.name}`);
    console.log(`  Artista:  ${track.artist}`);
    console.log(`  Duración: ${track.duration}`);
    console.log(`  Estado:   ${track.status}`);
    console.log(`  Hora:     ${track.startedAt}\n`);
  })
  .catch((error) => {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  });
