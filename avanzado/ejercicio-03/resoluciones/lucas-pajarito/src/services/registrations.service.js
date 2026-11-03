const registrations = [
  { id: 1, teamName: "Radiant Titans", region: "LATAM", averageMmr: 5800, captainRole: "Mid" },
];
let nextId = 2;

function listRegistrations() {
  return registrations;
}

function createRegistration(validData) {
  const entry = { id: nextId++, ...validData };
  registrations.push(entry);
  return entry;
}

export { listRegistrations, createRegistration };
