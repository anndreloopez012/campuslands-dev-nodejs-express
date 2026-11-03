// encargos de ilustraciones digitales que se pagan con creditos
// si un pedido se repite por error, se cobraria dos veces: por eso la ruta es idempotente

const PRECIOS = { boceto: 20, lineart: 45, color: 80, animado: 150 };

export class ErrorEncargo extends Error {
    constructor(status, mensaje, errores) {
        super(mensaje);
        this.status = status;
        this.errores = errores;
    }
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export function crearEncargos({ demoraCobroMs = 50, pasarela } = {}) {
    const creditos = new Map([
        ["ana", 200],
        ["beto", 30]
    ]);
    const encargos = [];
    let siguienteId = 1;

    // simula la pasarela de pago (tarda un poco, por eso se pueden cruzar pedidos)
    const cobrar =
        pasarela ??
        (async (usuario, monto) => {
            await esperar(demoraCobroMs);
            creditos.set(usuario, creditos.get(usuario) - monto);
            return { cobroId: `cob_${Date.now().toString(36)}_${siguienteId}` };
        });

    async function crear(usuario, body = {}) {
        const errores = [];
        if (!Object.hasOwn(PRECIOS, body.estilo)) errores.push(`estilo debe ser uno de: ${Object.keys(PRECIOS).join(", ")}`);
        if (typeof body.descripcion !== "string" || body.descripcion.trim().length < 5) errores.push("descripcion debe tener al menos 5 letras");
        if (body.personajes !== undefined && (!Number.isInteger(body.personajes) || body.personajes < 1 || body.personajes > 5)) errores.push("personajes debe ser de 1 a 5");
        if (errores.length > 0) throw new ErrorEncargo(400, "Datos invalidos", errores);

        const personajes = body.personajes ?? 1;
        const monto = PRECIOS[body.estilo] * personajes;
        if (!creditos.has(usuario)) throw new ErrorEncargo(404, `El usuario ${usuario} no tiene cuenta`);
        if (creditos.get(usuario) < monto) throw new ErrorEncargo(402, `Creditos insuficientes: cuesta ${monto} y tienes ${creditos.get(usuario)}`);

        const { cobroId } = await cobrar(usuario, monto);
        const encargo = { id: siguienteId++, usuario, estilo: body.estilo, descripcion: body.descripcion.trim(), personajes, monto, cobroId, estado: "en_cola" };
        encargos.push(encargo);
        return encargo;
    }

    return {
        crear,
        saldo: (usuario) => creditos.get(usuario),
        listar: (usuario) => encargos.filter((e) => e.usuario === usuario)
    };
}
