const AMPS_PER_MM = { MIG: 40, TIG: 35, SMAW: 30 };
const MATERIAL_FACTOR = { acero: 1, "acero inoxidable": 0.9, aluminio: 1.2 };
const TRANSITIONS = {
  pendiente: ["en_proceso", "cancelado"],
  en_proceso: ["terminado", "cancelado"],
  terminado: [],
  cancelado: [],
};

const PROCESS_NAMES = Object.keys(AMPS_PER_MM);
const MATERIAL_NAMES = Object.keys(MATERIAL_FACTOR);
const STATUSES = Object.keys(TRANSITIONS);
const MIN_THICKNESS_MM = 0.5;
const MAX_THICKNESS_MM = 25;
const MAX_AMPERAGE = 400;
const PASS_THICKNESS_MM = 6;

function recommendParameters({ process, material, thicknessMm }) {
  const amperage = Math.min(Math.round(thicknessMm * AMPS_PER_MM[process] * MATERIAL_FACTOR[material]), MAX_AMPERAGE);
  const passes = Math.ceil(thicknessMm / PASS_THICKNESS_MM);

  return { amperage, passes };
}

const canTransition = (from, to) => Object.hasOwn(TRANSITIONS, from) && TRANSITIONS[from].includes(to);

export { PROCESS_NAMES, MATERIAL_NAMES, STATUSES, MIN_THICKNESS_MM, MAX_THICKNESS_MM, MAX_AMPERAGE, recommendParameters, canTransition };
