const jobs = [];
const pendingQueue = [];
let nextId = 1;
let isProcessing = false;

function enqueueDiagnosticJob({ moto, system }) {
  if (!moto || typeof moto !== "string" || !moto.trim()) {
    throw new Error("moto es obligatorio");
  }
  if (!system || typeof system !== "string" || !system.trim()) {
    throw new Error("system es obligatorio");
  }

  const job = {
    id: nextId++,
    moto: moto.trim(),
    system: system.trim(),
    status: "queued",
    createdAt: new Date().toISOString(),
    completedAt: null,
    result: null,
  };

  jobs.push(job);
  pendingQueue.push(job);
  scheduleWorker();

  return job;
}

function scheduleWorker() {
  if (isProcessing || pendingQueue.length === 0) {
    return;
  }

  isProcessing = true;
  const currentJob = pendingQueue.shift();
  currentJob.status = "processing";

  setTimeout(() => {
    currentJob.status = "completed";
    currentJob.completedAt = new Date().toISOString();
    currentJob.result = `Sistema "${currentJob.system}" en ${currentJob.moto} verificado sin codigos de falla`;
    isProcessing = false;
    scheduleWorker();
  }, 150);
}

function listJobs() {
  return jobs;
}

function getJobById(id) {
  return jobs.find((j) => j.id === Number(id)) || null;
}

export { enqueueDiagnosticJob, listJobs, getJobById };
