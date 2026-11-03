import { HttpError } from "../../core/errors.js";
import { validate } from "../../core/validate.js";

const schema = {
    plate: { type: "string", pattern: /^[A-Z]{3}\d{2}[A-Z0-9]$/i, hint: "formato de placa AAA123 o AAA12B" },
    brand: { type: "string" },
    model: { type: "string" },
    year: { type: "integer", min: 1990, max: new Date().getFullYear() + 1 },
    mileageKm: { type: "integer", min: 0 },
    ownerName: { type: "string" },
};

function createMotorcyclesService(store) {
    const motorcycles = store.collection("motorcycles");

    function getOrFail(id) {
        const motorcycle = motorcycles.byId(id);
        if (!motorcycle) throw HttpError.notFound(`No existe la moto ${id}`);
        return motorcycle;
    }

    function assertPlateFree(plate, ignoreId) {
        const dup = motorcycles.find((m) => m.plate === plate && m.id !== ignoreId);
        if (dup) throw HttpError.conflict(`La placa ${plate} ya esta registrada`);
    }

    return {
        list: ({ brand } = {}) => motorcycles.all().filter((m) => !brand || m.brand.toLowerCase() === brand.toLowerCase()),
        get: getOrFail,

        create(input) {
            const data = validate(schema, input);
            data.plate = data.plate.toUpperCase();
            assertPlateFree(data.plate);
            return motorcycles.insert(data);
        },

        update(id, input) {
            getOrFail(id);
            const data = validate(schema, input, { partial: true });
            if (Object.keys(data).length === 0) throw HttpError.badRequest("No hay campos para actualizar");
            if (data.plate) {
                data.plate = data.plate.toUpperCase();
                assertPlateFree(data.plate, Number(id));
            }
            return motorcycles.update(id, data);
        },

        remove(id, workOrders) {
            getOrFail(id);
            if (workOrders.find((wo) => wo.motorcycleId === Number(id) && wo.status !== "delivered")) {
                throw HttpError.conflict("La moto tiene ordenes de trabajo abiertas");
            }
            motorcycles.remove(id);
        },
    };
}

export { createMotorcyclesService };
