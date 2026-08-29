const JOB_TTL_MS = 1000 * 60 * 60 * 24;

function getStore() {
  if (!globalThis.__talentSyncJobs) {
    globalThis.__talentSyncJobs = new Map();
  }
  return globalThis.__talentSyncJobs;
}

function pruneExpiredJobs() {
  const store = getStore();
  const now = Date.now();

  for (const [jobId, job] of store.entries()) {
    if (now - new Date(job.createdAt).getTime() > JOB_TTL_MS) {
      store.delete(jobId);
    }
  }
}

export function createJob({ userId, payload }) {
  pruneExpiredJobs();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const job = {
    id,
    userId,
    status: "queued",
    progress: 5,
    message: "Queued. Preparing request...",
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    payloadSummary: {
      companyName: payload.companyName || "",
      email: payload.email || "",
      mode: payload.mode || "job_seeker",
      eligibilityThreshold: payload.eligibilityThreshold ?? null,
    },
    result: null,
    error: null,
  };

  getStore().set(id, job);
  return job;
}

export function getJob(id) {
  pruneExpiredJobs();
  return getStore().get(id) || null;
}

export function updateJob(id, patch) {
  const store = getStore();
  const job = store.get(id);
  if (!job) return null;

  const updated = {
    ...job,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  store.set(id, updated);
  return updated;
}

export function listJobsByUser(userId, limit = 20) {
  pruneExpiredJobs();
  const jobs = [];

  for (const job of getStore().values()) {
    if (job.userId === userId) {
      jobs.push(job);
    }
  }

  jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return jobs.slice(0, limit);
}
