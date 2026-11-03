const inMemoryUsers = [
  {
    id: "USR-CHEF-01",
    name: "Mario Rossi",
    email: "chef@streetfood.com",
    password: "tacos_secret_pass",
    role: "Chef_Owner"
  },
  {
    id: "USR-FOODIE-02",
    name: "Camila Torres",
    email: "foodie@urbanroutes.com",
    password: "urban_burger_123",
    role: "Foodie"
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