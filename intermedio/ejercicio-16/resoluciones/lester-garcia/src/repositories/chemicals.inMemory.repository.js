const inMemoryFormulas = [
  {
    id: "1",
    formulaCode: "CHM-SULF-01",
    compoundName: "Ácido Sulfúrico Concentrado",
    molecularFormula: "H2SO4",
    hazardLevel: "Alto",
    purityPercentage: 98.5,
    storageTempCelsius: 20,
    createdById: "USR-DIR-01"
  },
  {
    id: "2",
    formulaCode: "CHM-CYAN-02",
    compoundName: "Cianuro de Potasio Sintetizado",
    molecularFormula: "KCN",
    hazardLevel: "Extremo (Biohazard)",
    purityPercentage: 99.2,
    storageTempCelsius: 4,
    createdById: "USR-SR-02"
  },
  {
    id: "3",
    formulaCode: "CHM-ETH-03",
    compoundName: "Etanol Absoluto Grado Reactivo",
    molecularFormula: "C2H5OH",
    hazardLevel: "Moderado",
    purityPercentage: 99.8,
    storageTempCelsius: 18,
    createdById: "USR-INV-03"
  }
];

export const findAllChemicals = async () => [...inMemoryFormulas];

export const findChemicalById = async (id) => {
  const formula = inMemoryFormulas.find((f) => f.id === String(id));
  return formula ? { ...formula } : null;
};

export const findChemicalByCode = async (formulaCode) => {
  const formula = inMemoryFormulas.find(
    (f) => f.formulaCode.toLowerCase() === formulaCode.toLowerCase().trim()
  );
  return formula ? { ...formula } : null;
};

export const saveChemical = async (formulaData) => {
  const newEntry = { ...formulaData };
  inMemoryFormulas.push(newEntry);
  return { ...newEntry };
};

export const deleteChemical = async (id) => {
  const index = inMemoryFormulas.findIndex((f) => f.id === String(id));
  if (index === -1) return false;
  inMemoryFormulas.splice(index, 1);
  return true;
};