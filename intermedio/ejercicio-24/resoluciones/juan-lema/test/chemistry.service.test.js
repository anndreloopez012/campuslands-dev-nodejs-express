import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseFormula, toHillFormula, molarMass, analyzeFormula, checkBalance, isKnownElement } from "../src/services/chemistry.service.js";

function assertDomainError(action, code, messagePattern) {
  assert.throws(action, (error) => {
    assert.equal(error.name, "DomainError");
    assert.equal(error.code, code);
    if (messagePattern) assert.match(error.message, messagePattern);
    return true;
  });
}

describe("isKnownElement", () => {
  for (const symbol of ["H", "O", "Fe", "Hg", "Pb"]) {
    it(`reconoce ${symbol}`, () => assert.equal(isKnownElement(symbol), true));
  }

  for (const symbol of ["h", "HE", "Xx", "", " ", undefined, null, 5, {}, "__proto__", "constructor", "toString", "hasOwnProperty"]) {
    it(`rechaza ${JSON.stringify(symbol) ?? String(symbol)}`, () => assert.equal(isKnownElement(symbol), false));
  }
});

describe("parseFormula: formulas validas", () => {
  const valid = [
    ["H2O", { H: 2, O: 1 }],
    ["O2", { O: 2 }],
    ["NaCl", { Na: 1, Cl: 1 }],
    ["He", { He: 1 }],
    ["CO", { C: 1, O: 1 }],
    ["Co", { Co: 1 }],
    ["Ca(OH)2", { Ca: 1, O: 2, H: 2 }],
    ["Fe2(SO4)3", { Fe: 2, S: 3, O: 12 }],
    ["Al2(SO4)3", { Al: 2, S: 3, O: 12 }],
    ["C6H12O6", { C: 6, H: 12, O: 6 }],
    ["C2H5OH", { C: 2, H: 6, O: 1 }],
    ["CH3COOH", { C: 2, H: 4, O: 2 }],
    ["(NH4)2SO4", { N: 2, H: 8, S: 1, O: 4 }],
    ["Mg3(PO4)2", { Mg: 3, P: 2, O: 8 }],
    ["K4[Fe(CN)6]", { K: 4, Fe: 1, C: 6, N: 6 }],
    ["Ca(Al(OH)4)2", { Ca: 1, Al: 2, O: 8, H: 8 }],
    ["(H2O)3", { H: 6, O: 3 }],
    ["CuSO4·5H2O", { Cu: 1, S: 1, O: 9, H: 10 }],
    ["CuSO4.5H2O", { Cu: 1, S: 1, O: 9, H: 10 }],
    ["CuSO4·H2O", { Cu: 1, S: 1, O: 5, H: 2 }],
    ["Na2CO3·10H2O", { Na: 2, C: 1, O: 13, H: 20 }],
    ["H999", { H: 999 }],
    ["  H2O  ", { H: 2, O: 1 }],
  ];

  for (const [formula, expected] of valid) {
    it(`${JSON.stringify(formula)} -> ${JSON.stringify(expected)}`, () => assert.deepEqual(parseFormula(formula), expected));
  }

  it("distingue mayusculas: CO (carbono y oxigeno) no es Co (cobalto)", () => {
    assert.notDeepEqual(parseFormula("CO"), parseFormula("Co"));
  });

  it("un multiplicador de grupo equivale a repetir sus atomos", () => {
    for (const group of ["H2O", "OH", "SO4", "NH4", "CN"]) {
      for (const times of [2, 3, 10]) {
        const base = parseFormula(group);
        const expected = Object.fromEntries(Object.entries(base).map(([symbol, count]) => [symbol, count * times]));

        assert.deepEqual(parseFormula(`(${group})${times}`), expected, `(${group})${times}`);
      }
    }
  });

  it("cada llamada devuelve un objeto nuevo (mutar uno no afecta a los siguientes)", () => {
    const first = parseFormula("H2O");
    first.H = 999;
    first.Zz = 1;

    assert.deepEqual(parseFormula("H2O"), { H: 2, O: 1 });
  });
});

describe("parseFormula: formulas invalidas", () => {
  const invalid = [
    ["cadena vacia", "", "INVALID_FORMULA", /obligatoria/],
    ["solo espacios", "   ", "INVALID_FORMULA", /obligatoria/],
    ["null", null, "INVALID_FORMULA", /obligatoria/],
    ["undefined", undefined, "INVALID_FORMULA", /obligatoria/],
    ["numero", 42, "INVALID_FORMULA", /obligatoria/],
    ["objeto", {}, "INVALID_FORMULA", /obligatoria/],
    ["minuscula inicial", "h2o", "INVALID_FORMULA", /Caracter inesperado "h"/],
    ["tres letras seguidas", "Cll", "INVALID_FORMULA", /Caracter inesperado "l"/],
    ["signo extrano", "H2O!", "INVALID_FORMULA", /Caracter inesperado "!"/],
    ["espacio interno", "H 2O", "INVALID_FORMULA", /Caracter inesperado " "/],
    ["coeficiente inicial", "2H2O", "INVALID_FORMULA", /Caracter inesperado "2"/],
    ["numero al inicio de un grupo", "(2H)", "INVALID_FORMULA", /Caracter inesperado "2"/],
    ["salto de linea", "H2\nO", "INVALID_FORMULA", /Caracter inesperado/],
    ["salto de linea en un hidrato (no debe romper)", "CuSO4·H2\nO", "INVALID_FORMULA", /Caracter inesperado/],
    ["elemento inexistente de dos letras", "Xx", "UNKNOWN_ELEMENT", /Xx/],
    ["elemento inexistente con subindice", "Zz2", "UNKNOWN_ELEMENT", /Zz/],
    ["elemento fuera de la tabla", "Cn", "UNKNOWN_ELEMENT", /Cn/],
    ["letra suelta inexistente", "J", "UNKNOWN_ELEMENT", /J/],
    ["subindice cero", "H0", "INVALID_FORMULA", /Numero invalido "0"/],
    ["subindice con cero inicial", "H01", "INVALID_FORMULA", /"01"/],
    ["subindice de cuatro cifras", "H1000", "INVALID_FORMULA", /"1000"/],
    ["multiplicador de grupo cero", "(OH)0", "INVALID_FORMULA", /Numero invalido "0"/],
    ["parentesis sin cerrar", "(H2O", "INVALID_FORMULA", /Falta cerrar "\("/],
    ["corchete sin cerrar", "K4[Fe(CN)6", "INVALID_FORMULA", /Falta cerrar "\["/],
    ["cierre sin apertura", "H2O)", "INVALID_FORMULA", /Cierre "\)"/],
    ["parentesis cerrado con corchete", "(H2O]", "INVALID_FORMULA", /Cierre "\]"/],
    ["corchete cerrado con parentesis", "[H2O)", "INVALID_FORMULA", /Cierre "\)"/],
    ["grupo vacio", "()", "INVALID_FORMULA", /Grupo vacio/],
    ["hidrato sin formula", "CuSO4·", "INVALID_FORMULA", /parte vacia/],
    ["hidrato solo con coeficiente", "CuSO4·5", "INVALID_FORMULA", /parte vacia/],
    ["separador al inicio", "·H2O", "INVALID_FORMULA", /parte vacia/],
    ["separadores dobles", "CuSO4··H2O", "INVALID_FORMULA", /parte vacia/],
    ["coeficiente de hidrato cero", "CuSO4·0H2O", "INVALID_FORMULA", /Numero invalido "0"/],
    ["formula demasiado larga", "H".repeat(101), "INVALID_FORMULA", /demasiado larga/],
  ];

  for (const [label, formula, code, pattern] of invalid) {
    it(`${label} -> ${code}`, () => assertDomainError(() => parseFormula(formula), code, pattern));
  }

  it("acepta una formula de exactamente 100 caracteres", () => {
    const formula = "H2".repeat(50);

    assert.equal(formula.length, 100);
    assert.deepEqual(parseFormula(formula), { H: 100 });
  });
});

describe("toHillFormula", () => {
  const cases = [
    [{ C: 6, H: 12, O: 6 }, "C6H12O6"],
    [{ C: 2, H: 5, Cl: 1 }, "C2H5Cl"],
    [{ C: 2, O: 5, N: 1, H: 5 }, "C2H5NO5"],
    [{ C: 1, Cl: 4 }, "CCl4"],
    [{ C: 1, O: 2 }, "CO2"],
    [{ H: 2, O: 1 }, "H2O"],
    [{ Na: 1, Cl: 1 }, "ClNa"],
    [{ Ca: 1, O: 2, H: 2 }, "CaH2O2"],
    [{ H: 2, S: 1, O: 4 }, "H2O4S"],
    [{ O: 1 }, "O"],
    [{}, ""],
  ];

  for (const [composition, expected] of cases) {
    it(`${JSON.stringify(composition)} -> ${JSON.stringify(expected)}`, () => assert.equal(toHillFormula(composition), expected));
  }

  it("omite el subindice 1 y conserva los mayores", () => {
    assert.equal(toHillFormula({ H: 1, Cl: 1 }), "ClH");
    assert.equal(toHillFormula({ H: 10 }), "H10");
  });

  it("no depende del orden en que vengan los elementos", () => {
    assert.equal(toHillFormula({ O: 6, H: 12, C: 6 }), toHillFormula({ C: 6, O: 6, H: 12 }));
  });

  it("re-parsear la formula de Hill devuelve la misma composicion", () => {
    for (const formula of ["H2O", "NaCl", "Ca(OH)2", "Fe2(SO4)3", "C6H12O6", "(NH4)2SO4", "K4[Fe(CN)6]", "CuSO4·5H2O", "CH3COOH", "Na2CO3·10H2O"]) {
      const composition = parseFormula(formula);

      assert.deepEqual(parseFormula(toHillFormula(composition)), composition, formula);
    }
  });
});

describe("molarMass", () => {
  const cases = [
    ["O2", 31.998],
    ["H2O", 18.015],
    ["CO2", 44.009],
    ["NaCl", 58.44],
    ["Ca(OH)2", 74.092],
    ["C6H12O6", 180.156],
    ["Fe2(SO4)3", 399.858],
    ["CuSO4·5H2O", 249.677],
    ["H999", 1006.992],
  ];

  for (const [formula, expected] of cases) {
    it(`${formula} -> ${expected} g/mol`, () => assert.equal(molarMass(parseFormula(formula)), expected));
  }

  it("redondea a 3 decimales (sin ruido de coma flotante)", () => {
    const value = molarMass(parseFormula("H2O"));

    assert.equal(value, 18.015);
    assert.equal(String(value), "18.015");
  });

  it("la masa de un hidrato es la de la sal mas la de sus aguas", () => {
    const hydrate = molarMass(parseFormula("CuSO4·5H2O"));
    const parts = molarMass(parseFormula("CuSO4")) + 5 * molarMass(parseFormula("H2O"));

    assert.ok(Math.abs(hydrate - parts) < 0.006, `${hydrate} vs ${parts}`);
  });

  it("es aditiva: duplicar los atomos duplica la masa", () => {
    for (const formula of ["H2O", "NaCl", "C6H12O6", "Ca(OH)2"]) {
      const single = molarMass(parseFormula(formula));
      const double = molarMass(parseFormula(`(${formula})2`));

      assert.ok(Math.abs(double - 2 * single) < 0.006, formula);
    }
  });
});

describe("analyzeFormula", () => {
  it("devuelve formula, Hill, composicion, masa molar y porcentaje en masa", () => {
    assert.deepEqual(analyzeFormula("H2O"), {
      formula: "H2O",
      hill: "H2O",
      composition: { H: 2, O: 1 },
      molarMass: 18.015,
      massPercent: { H: 11.19, O: 88.81 },
    });
  });

  it("recorta la formula pero conserva su notacion original", () => {
    const analysis = analyzeFormula("  OH2 ");

    assert.equal(analysis.formula, "OH2");
    assert.equal(analysis.hill, "H2O");
  });

  it("para NaCl da 39.34 % de sodio y 60.66 % de cloro", () => {
    assert.deepEqual(analyzeFormula("NaCl").massPercent, { Na: 39.34, Cl: 60.66 });
  });

  it("los porcentajes en masa suman 100 (salvo el redondeo)", () => {
    for (const formula of ["H2O", "NaCl", "Ca(OH)2", "Fe2(SO4)3", "C6H12O6", "CuSO4·5H2O", "K4[Fe(CN)6]"]) {
      const { massPercent } = analyzeFormula(formula);
      const total = Object.values(massPercent).reduce((sum, value) => sum + value, 0);

      assert.ok(Math.abs(total - 100) <= 0.005 * Object.keys(massPercent).length + 1e-9, `${formula} suma ${total}`);
    }
  });

  it("propaga los errores del analizador", () => {
    assertDomainError(() => analyzeFormula("Xx2"), "UNKNOWN_ELEMENT");
    assertDomainError(() => analyzeFormula(undefined), "INVALID_FORMULA");
  });
});

describe("checkBalance: ecuaciones balanceadas", () => {
  const reactions = [
    { name: "formacion del agua", left: [[2, "H2"], [1, "O2"]], right: [[2, "H2O"]] },
    { name: "combustion del metano", left: [[1, "CH4"], [2, "O2"]], right: [[1, "CO2"], [2, "H2O"]] },
    { name: "reduccion del hierro", left: [[1, "Fe2O3"], [3, "CO"]], right: [[2, "Fe"], [3, "CO2"]] },
    { name: "respiracion celular", left: [[1, "C6H12O6"], [6, "O2"]], right: [[6, "CO2"], [6, "H2O"]] },
    { name: "deshidratacion de un hidrato", left: [[1, "CuSO4·5H2O"]], right: [[1, "CuSO4"], [5, "H2O"]] },
  ];
  const write = (terms, factor = 1) => terms.map(([coefficient, formula]) => `${coefficient * factor}${formula}`).join(" + ");
  const equationOf = ({ left, right }, factor = 1) => `${write(left, factor)} -> ${write(right, factor)}`;

  for (const reaction of reactions) {
    it(`${reaction.name}: ${equationOf(reaction)}`, () => {
      const result = checkBalance(equationOf(reaction));

      assert.equal(result.balanced, true);
      assert.deepEqual(result.difference, {});
      assert.deepEqual(result.reactants, result.products);
    });

    it(`${reaction.name}: sigue balanceada al multiplicar todos los coeficientes`, () => {
      for (const factor of [2, 3, 10]) assert.equal(checkBalance(equationOf(reaction, factor)).balanced, true, `x${factor}`);
    });
  }

  it("da el total de atomos por lado", () => {
    assert.deepEqual(checkBalance("CH4 + 2O2 -> CO2 + 2H2O").reactants, { C: 1, H: 4, O: 4 });
    assert.deepEqual(checkBalance("CH4 + 2O2 -> CO2 + 2H2O").products, { C: 1, O: 4, H: 4 });
  });

  for (const [label, equation] of [
    ["sin espacios", "2H2+O2->2H2O"],
    ["con flecha unicode", "2H2 + O2 → 2H2O"],
    ["con flecha =>", "2H2 + O2 => 2H2O"],
    ["con espacios entre coeficiente y formula", "2 H2 + 1 O2 -> 2 H2O"],
    ["con espacios de sobra", "   2H2   +   O2   ->   2H2O   "],
  ]) {
    it(`admite la notacion ${label}`, () => assert.equal(checkBalance(equation).balanced, true));
  }

  it("un hidrato con coeficiente delante se multiplica completo", () => {
    assert.equal(checkBalance("2CuSO4·5H2O -> 2CuSO4 + 10H2O").balanced, true);
  });
});

describe("checkBalance: ecuaciones desbalanceadas", () => {
  const cases = [
    ["falta un oxigeno en los productos", "H2 + O2 -> H2O", { O: -1 }],
    ["falta cloro en los productos", "Na + Cl2 -> NaCl", { Cl: -1 }],
    ["hidrogeno y oxigeno a la vez", "CH4 + O2 -> CO2 + H2O", { O: 1, H: -2 }],
    ["un elemento solo aparece en los productos", "H2 -> H2O", { O: 1 }],
    ["un elemento solo aparece en los reactivos", "H2O -> H2", { O: -1 }],
    ["coeficiente de menos", "2H2 + O2 -> H2O", { H: -2, O: -1 }],
  ];

  for (const [label, equation, difference] of cases) {
    it(`${label}: ${equation}`, () => {
      const result = checkBalance(equation);

      assert.equal(result.balanced, false);
      assert.deepEqual(result.difference, difference);
    });
  }

  it("intercambiar reactivos y productos invierte el signo de la diferencia", () => {
    const forward = checkBalance("CH4 + O2 -> CO2 + H2O").difference;
    const backward = checkBalance("CO2 + H2O -> CH4 + O2").difference;

    assert.deepEqual(backward, Object.fromEntries(Object.entries(forward).map(([symbol, delta]) => [symbol, -delta])));
  });

  it("balanced es verdadero si y solo si no hay diferencias", () => {
    for (const equation of ["H2 + O2 -> H2O", "2H2 + O2 -> 2H2O", "H2 -> H2", "H2 -> O2"]) {
      const { balanced, difference } = checkBalance(equation);

      assert.equal(balanced, Object.keys(difference).length === 0, equation);
    }
  });
});

describe("checkBalance: ecuaciones invalidas", () => {
  const invalid = [
    ["cadena vacia", "", "INVALID_EQUATION", /obligatoria/],
    ["solo espacios", "   ", "INVALID_EQUATION", /obligatoria/],
    ["null", null, "INVALID_EQUATION", /obligatoria/],
    ["numero", 42, "INVALID_EQUATION", /obligatoria/],
    ["sin flecha", "H2 + O2", "INVALID_EQUATION", /exactamente una flecha/],
    ["dos flechas", "H2 -> H2 -> H2", "INVALID_EQUATION", /exactamente una flecha/],
    ["lado derecho vacio", "H2 ->", "INVALID_EQUATION", /termino vacio/],
    ["lado izquierdo vacio", "-> H2", "INVALID_EQUATION", /termino vacio/],
    ["termino vacio entre signos +", "H2 + -> H2", "INVALID_EQUATION", /termino vacio/],
    ["coeficiente cero", "0H2 -> H2", "INVALID_EQUATION", /Coeficiente invalido "0"/],
    ["coeficiente con cero inicial", "01H2 -> H2", "INVALID_EQUATION", /Coeficiente invalido "01"/],
    ["coeficiente de cuatro cifras", "1000H2 -> H2", "INVALID_EQUATION", /Coeficiente invalido "1000"/],
    ["ecuacion demasiado larga", `${"H2 + ".repeat(70)}H2 -> H2`, "INVALID_EQUATION", /demasiado larga/],
    ["elemento inexistente", "Xx -> Xx", "UNKNOWN_ELEMENT", /Xx/],
    ["formula mal escrita", "h2 -> H2", "INVALID_FORMULA", /Caracter inesperado "h"/],
    ["termino que es solo un numero", "2 -> H2", "INVALID_FORMULA", /Caracter inesperado "2"/],
    ["salto de linea dentro de un termino (no debe romper)", "H2\nO -> H2O", "INVALID_FORMULA", /Caracter inesperado/],
  ];

  for (const [label, equation, code, pattern] of invalid) {
    it(`${label} -> ${code}`, () => assertDomainError(() => checkBalance(equation), code, pattern));
  }
});
