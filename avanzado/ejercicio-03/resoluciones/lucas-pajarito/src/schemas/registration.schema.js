const registrationSchema = {
  teamName: {
    type: "string",
    required: true,
    minLength: 3,
  },
  region: {
    type: "string",
    required: true,
    enum: ["LATAM", "NA", "EU", "KR"],
  },
  averageMmr: {
    type: "number",
    required: true,
    min: 2000,
    max: 12000,
  },
  captainRole: {
    type: "string",
    required: true,
    enum: ["Mid", "Carry", "Jungla", "Soporte", "Offlane"],
  },
};

export { registrationSchema };
