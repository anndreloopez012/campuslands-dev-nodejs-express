import { loadTrack } from "./services/track.service.js";

loadTrack(process.argv[2] ?? "Noche de plata")
  .then((track) => {
    console.log(
      JSON.stringify(
        { ok: true, topic: "promesas basicas", track },
        null,
        2,
      ),
    );
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
