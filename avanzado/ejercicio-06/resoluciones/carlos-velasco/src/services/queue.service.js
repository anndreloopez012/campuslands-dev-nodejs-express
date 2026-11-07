"use strict";
const jobs = [];
let id = 1,
  running = 0;
const concurrency = 2;
function enqueue({ body }) {
  if (typeof body?.payload !== "string" || !body.payload.trim())
    throw Object.assign(new Error("payload requerido"), {
      status: 400,
      code: "INVALID_JOB",
    });
  const job = {
    id: id++,
    payload: body.payload.trim(),
    state: "queued",
    attempts: 0,
    createdAt: new Date().toISOString(),
  };
  jobs.push(job);
  return { ...job };
}
function list() {
  return { concurrency, running, jobs: jobs.map((j) => ({ ...j })) };
}
async function run() {
  const selected = jobs
    .filter((j) => j.state === "queued")
    .slice(0, concurrency - running);
  await Promise.all(
    selected.map(async (j) => {
      running++;
      j.state = "running";
      j.attempts++;
      await new Promise((resolve) => setTimeout(resolve, 5));
      j.state = "completed";
      j.finishedAt = new Date().toISOString();
      running--;
    }),
  );
  return list();
}
module.exports = { enqueue, list, run };
