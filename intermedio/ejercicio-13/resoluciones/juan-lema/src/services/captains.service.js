const captains = [
  { id: 1, name: "Ada Voss", rank: "comandante" },
  { id: 2, name: "Kiran Thale", rank: "capitan" },
];
let nextId = 3;

const listCaptains = () => captains;
const getCaptainById = (id) => captains.find((c) => c.id === Number(id)) || null;

function createCaptain({ name, rank }) {
  if (!name || typeof name !== "string" || !name.trim()) throw new Error("name es obligatorio");
  if (!rank || typeof rank !== "string" || !rank.trim()) throw new Error("rank es obligatorio");

  const captain = { id: nextId++, name: name.trim(), rank: rank.trim() };
  captains.push(captain);
  return captain;
}

export { listCaptains, getCaptainById, createCaptain };
