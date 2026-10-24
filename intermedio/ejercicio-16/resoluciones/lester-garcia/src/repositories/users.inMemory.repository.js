const inMemoryUsers = [
  {
    id: "USR-DIR-01",
    name: "Dra. Elena Vasquez",
    email: "directora@labchem.org",
    password: "director_master_pass_2026",
    role: "Director_Laboratorio"
  },
  {
    id: "USR-SR-02",
    name: "Dr. Walter Aris",
    email: "senior@labchem.org",
    password: "senior_synthesis_pass",
    role: "Quimico_Senior"
  },
  {
    id: "USR-INV-03",
    name: "Lic. Mateo Gomez",
    email: "investigador@labchem.org",
    password: "junior_research_pass",
    role: "Investigador"
  }
];

export const findUserByEmail = async (email) => {
  const user = inMemoryUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  return user ? { ...user } : null;
};

export const findUserById = async (id) => {
  const user = inMemoryUsers.find((u) => u.id === String(id));
  return user ? { ...user } : null;
};