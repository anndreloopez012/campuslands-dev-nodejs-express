import { enqueueDiagnosticJob, listJobs, getJobById } from "../services/diagnostics-queue.service.js";

function getJobs(req, res) {
  res.status(200).json({ ok: true, data: listJobs() });
}

function getJob(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const job = getJobById(id);
  if (!job) {
    res.status(404).json({ ok: false, message: `Job con id ${id} no encontrado` });
    return;
  }

  res.status(200).json({ ok: true, data: job });
}

function postJob(req, res) {
  try {
    const job = enqueueDiagnosticJob(req.body || {});
    res.location(`/diagnostics/jobs/${job.id}`);
    res.status(202).json({ ok: true, message: "Tarea encolada para procesamiento", data: job });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getJobs, getJob, postJob };
