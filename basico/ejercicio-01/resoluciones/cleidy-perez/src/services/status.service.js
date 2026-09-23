class StatusService {
  getSystemStatus() {
    return {
      status: "online",
      serverRealm: "Aldea del Inicio - Servidor Alfa",
      runtimeInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new StatusService();