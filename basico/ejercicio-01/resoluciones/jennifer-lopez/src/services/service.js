export const getHeroStatus = () => {
  return {
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "Node runtime y consola",
    data: {
      name: "Guerrero de Eldoria",
      level: 1,
      health: 100,
      mana: 50,
      status: "Listo para la aventura"
    }
  };
};