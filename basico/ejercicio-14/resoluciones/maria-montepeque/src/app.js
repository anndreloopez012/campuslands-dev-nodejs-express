import { validate } from "./validators/validate.js";
import { bookSchema } from "./schemas/book.schema.js";

const input = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
        const [key, ...rest] = arg.split("=");
        return [key, rest.join("=")];
    })
);

const { valid, errors, data } = validate(bookSchema, input);

if (!valid) {
    console.error("Registro de libro rechazado:");
    for (const [field, messages] of Object.entries(errors)) {
        console.error(`- ${field}: ${messages.join("; ")}`);
    }
    process.exitCode = 1;
} else {
    console.log("Libro registrado:");
    console.table(data);
}