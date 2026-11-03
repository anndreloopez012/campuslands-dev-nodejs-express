let inMemoryFormulas = [
  {
    id: "CHM-01",
    commonName: "Ácido Sulfúrico",
    molecularFormula: "H2SO4",
    molarMassGmol: 98.079,
    phLevel: 1.2,
    acidityCategory: "Acido_Fuerte",
    molarityMolL: 0.51,
    createdAt: "2026-10-10T10:00:00.000Z"
  },
  {
    id: "CHM-02",
    commonName: "Hidróxido de Sodio",
    molecularFormula: "NaOH",
    molarMassGmol: 39.997,
    phLevel: 13.5,
    acidityCategory: "Base_Fuerte",
    molarityMolL: 1.25,
    createdAt: "2026-10-11T12:00:00.000Z"
  }
];

export const findAllFormulas = async () => [...inMemoryFormulas];

export const findFormulaById = async (id) => {
  const item = inMemoryFormulas.find((f) => f.id === String(id));
  return item ? { ...item } : null;
};

export const findFormulaByMolecular = async (molecularFormula) => {
  const item = inMemoryFormulas.find(
    (f) => f.molecularFormula.toUpperCase() === molecularFormula.trim().toUpperCase()
  );
  return item ? { ...item } : null;
};

export const saveFormula = async (data) => {
  const newItem = { ...data };
  inMemoryFormulas.push(newItem);
  return { ...newItem };
};

export const resetFormulasStore = (seedData) => {
  inMemoryFormulas = seedData ? [...seedData] : [];
};
