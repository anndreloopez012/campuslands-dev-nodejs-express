import { listTracks, importTracksBulk } from "../services/bulk-tracks.service.js";

function getTracks(req, res) {
  res.status(200).json({ ok: true, data: listTracks() });
}

function postTracksBulk(req, res) {
  try {
    const summary = importTracksBulk((req.body || {}).tracks);
    const statusCode = summary.rejectedCount === 0 ? 201 : 207;
    res.status(statusCode).json({ ok: true, data: summary });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getTracks, postTracksBulk };
