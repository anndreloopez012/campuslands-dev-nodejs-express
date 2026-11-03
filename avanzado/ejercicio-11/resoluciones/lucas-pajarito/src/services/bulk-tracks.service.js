const tracks = [
  { id: 1, title: "Hotel California", artist: "Eagles", durationSeconds: 390 },
];
let nextId = 2;

function listTracks() {
  return tracks;
}

function importTracksBulk(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("tracks debe ser un arreglo no vacio");
  }

  const inserted = [];
  const rejected = [];

  items.forEach((item, index) => {
    const title = item && typeof item.title === "string" ? item.title.trim() : "";
    const artist = item && typeof item.artist === "string" ? item.artist.trim() : "";
    const duration = Number(item ? item.durationSeconds : NaN);

    if (!title || !artist || Number.isNaN(duration) || duration <= 0) {
      rejected.push({
        index,
        reason: "title, artist y durationSeconds (> 0) son obligatorios",
      });
      return;
    }

    const created = { id: nextId++, title, artist, durationSeconds: duration };
    tracks.push(created);
    inserted.push(created);
  });

  return {
    totalReceived: items.length,
    insertedCount: inserted.length,
    rejectedCount: rejected.length,
    inserted,
    rejected,
  };
}

export { listTracks, importTracksBulk };
