const jumps = [
  {
    id: 1,
    jumper: "Carlos Velasco",
    altitude: 12000,
    location: "Antigua Guatemala",
    level: "intermedio"
  }
];

function createJump(jumpData) {
  const newJump = {
    id: jumps.length + 1,
    jumper: jumpData.jumper,
    altitude: jumpData.altitude,
    location: jumpData.location,
    level: jumpData.level
  };

  jumps.push(newJump);

  return newJump;
}

function getJumps() {
  return jumps;
}

module.exports = {
  createJump,
  getJumps
};