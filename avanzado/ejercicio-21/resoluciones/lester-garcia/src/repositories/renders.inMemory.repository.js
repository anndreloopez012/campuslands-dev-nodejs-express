const initialItems = [
  {
    "id": "RND-01",
    "sceneName": "Cyberpunk_Alley_Shot04.blend",
    "engine": "Cycles_OptiX",
    "frames": 240,
    "status": "ACTIVE_GPU_SLOT"
  },
  {
    "id": "RND-02",
    "sceneName": "Character_Rig_WalkCycle.ma",
    "engine": "Arnold_GPU",
    "frames": 120,
    "status": "COMPLETED"
  }
];

let store = [...initialItems];

export const findAll = async () => [...store];

export const findById = async (id) =>
  store.find((item) => item.id.toUpperCase() === String(id).toUpperCase()) || null;

export const save = async (record) => {
  store.push(record);
  return record;
};
