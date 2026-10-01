const animations = [
  {
    id: 1,
    title: "Robot futurista",
    software: "Blender",
    duration: 12
  },
  {
    id: 2,
    title: "Criatura fantástica",
    software: "Maya",
    duration: 18
  },
  {
    id: 3,
    title: "Vehículo espacial",
    software: "Cinema 4D",
    duration: 10
  }
];

const getAllAnimations = () => {
  return animations;
};

const getAnimationById = (id) => {
  return animations.find((animation) => animation.id === id);
};

const createAnimation = ({ title, software, duration }) => {
  const newAnimation = {
    id: animations.length + 1,
    title,
    software,
    duration
  };

  animations.push(newAnimation);

  return newAnimation;
};

module.exports = {
  getAllAnimations,
  getAnimationById,
  createAnimation
};