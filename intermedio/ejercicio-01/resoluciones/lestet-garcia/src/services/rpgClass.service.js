import * as rpgRepository from "../repositories/rpgClass.repository.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getAllClassesService = async (filters = {}) => {
  let classes = await rpgRepository.findAllClasses();
  const { attribute, isActive } = filters;

  if (attribute) {
    classes = classes.filter(
      (c) => c.primaryAttribute.toLowerCase() === attribute.toLowerCase()
    );
  }

  if (isActive !== undefined) {
    const activeBool = isActive === "true";
    classes = classes.filter((c) => c.isActive === activeBool);
  }

  return classes;
};

export const getClassByIdService = async (id) => {
  const rpgClass = await rpgRepository.findClassById(id);

  if (!rpgClass) {
    throw new NotFoundError(`La clase RPG con ID '${id}' no existe en el registro.`);
  }

  return rpgClass;
};

export const createClassService = async (classData) => {
  const existing = await rpgRepository.findClassByName(classData.className);

  if (existing) {
    throw new ConflictError(`La clase RPG '${classData.className}' ya ha sido registrada.`);
  }

  const newClass = {
    id: String(Date.now()),
    ...classData,
    baseHealth: Number(classData.baseHealth),
    baseMana: Number(classData.baseMana),
    isActive: classData.isActive !== undefined ? Boolean(classData.isActive) : true
  };

  return await rpgRepository.saveClass(newClass);
};

export const updateClassService = async (id, updateData) => {
  const rpgClass = await rpgRepository.findClassById(id);
  if (!rpgClass) {
    throw new NotFoundError(`No se puede actualizar. La clase con ID '${id}' no existe.`);
  }

  if (updateData.className) {
    const nameConflict = await rpgRepository.findClassByName(updateData.className);
    if (nameConflict && nameConflict.id !== String(id)) {
      throw new ConflictError(`El nombre de clase '${updateData.className}' ya está en uso.`);
    }
  }

  const sanitizedData = {
    ...updateData,
    baseHealth: updateData.baseHealth ? Number(updateData.baseHealth) : rpgClass.baseHealth,
    baseMana: updateData.baseMana ? Number(updateData.baseMana) : rpgClass.baseMana,
    isActive: updateData.isActive !== undefined ? Boolean(updateData.isActive) : rpgClass.isActive
  };

  const updated = await rpgRepository.updateClassInStore(id, sanitizedData);
  return updated;
};

export const deleteClassService = async (id) => {
  const success = await rpgRepository.deleteClassFromStore(id);

  if (!success) {
    throw new NotFoundError(`No se puede eliminar. La clase con ID '${id}' no fue encontrada.`);
  }
};