import { test } from "node:test";
import assert from "node:assert/strict";
import { recordMatch, standings } from "./league.service.js";

test("un partido de futbol actualiza la tabla con 3 puntos al ganador", () => {
    recordMatch({ homeId: 1, awayId: 2, homeGoals: 2, awayGoals: 1 });
    const [leader, second] = standings("futbol");

    assert.equal(leader.team, "Halcones del Sur");
    assert.equal(leader.points, 3);
    assert.equal(second.points, 0);
});

test("no se puede cruzar futbol con futsal", () => {
    assert.throws(() => recordMatch({ homeId: 1, awayId: 3, homeGoals: 1, awayGoals: 1 }), { status: 409 });
});

test("un resultado con goles invalidos responde 422 con detalles", () => {
    assert.throws(() => recordMatch({ homeId: 3, awayId: 4, homeGoals: -1, awayGoals: 99 }), (error) => error.status === 422 && error.details.length === 2);
});
