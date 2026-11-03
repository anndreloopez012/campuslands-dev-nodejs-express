import * as repo from "../repositories/transfers.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
const clubBudgets = {
  "Inter Movistar": 900000,
  "Barça Futsal": 1200000,
  "Real Betis Futsal": 300000
};

export const listItemsService = async () => {
  const transfers = await repo.findAll();
  return { clubBudgets: { ...clubBudgets }, transfers };
};

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`La transferencia '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  const { player, fromClub, toClub, amountEur } = payload || {};
  const amount = Number(amountEur);
  if (!player || !fromClub || !toClub || Number.isNaN(amount) || amount <= 0) {
    throw new BadRequestError("Datos de fichaje incompletos ('player', 'fromClub', 'toClub', 'amountEur').");
  }

  // Snapshot previo para rollback atómico
  const budgetSnapshot = { ...clubBudgets };
  const itemsSnapshot = await repo.findAll();

  try {
    const buyerBalance = clubBudgets[toClub] ?? 500000;
    const sellerBalance = clubBudgets[fromClub] ?? 500000;

    clubBudgets[fromClub] = sellerBalance + amount;
    if (buyerBalance < amount) {
      throw new ConflictError(
        `Transacción abortada (Rollback ejecutado): '${toClub}' tiene €${buyerBalance} y el fichaje cuesta €${amount}.`
      );
    }
    clubBudgets[toClub] = buyerBalance - amount;

    return await repo.save({
      id: `TRF-0${itemsSnapshot.length + 1}`,
      player: player.trim(),
      fromClub: fromClub.trim(),
      toClub: toClub.trim(),
      amountEur: amount,
      status: "COMMITTED"
    });
  } catch (err) {
    Object.assign(clubBudgets, budgetSnapshot);
    throw err;
  }
};
