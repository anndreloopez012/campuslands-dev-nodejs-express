const getHealthStatus = () => {
    return {
      ok: true,
      message: "Ejercicio ejecutado correctamente",
      topic: "Node runtime y consola",
      runtime: "Node.js",
      status: "running"
    };
  };
  
  module.exports = {
    getHealthStatus
  };