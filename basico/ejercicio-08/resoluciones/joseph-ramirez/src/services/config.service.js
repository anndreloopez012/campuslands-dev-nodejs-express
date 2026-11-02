function getEnvironmentConfig() {
    return {
      appName: process.env.APP_NAME || "HyperDrive API",
      environment: process.env.APP_ENV || "development",
      port: Number(process.env.PORT) || 3000
    };
  }
  
  module.exports = {
    getEnvironmentConfig
  };