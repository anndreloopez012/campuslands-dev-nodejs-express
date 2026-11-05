import { MONEDAS } from '../constants/autos.js';

export const tasaDeLujo = (precioUsd) => {
  if (precioUsd > 500000) return 0.2;
  if (precioUsd > 200000) return 0.15;
  return 0.1;
};

const SEGURO = 0.02;

const convertir = (usd, moneda) => Math.round(usd * MONEDAS[moneda]);

export function cotizar(auto, { moneda, anticipoPorcentaje, meses }) {
  const impuestoUsd = Math.round(auto.precioUsd * tasaDeLujo(auto.precioUsd));
  const seguroUsd = Math.round(auto.precioUsd * SEGURO);
  const totalUsd = auto.precioUsd + impuestoUsd + seguroUsd;
  const anticipoUsd = Math.round(totalUsd * (anticipoPorcentaje / 100));
  const financiadoUsd = totalUsd - anticipoUsd;
  return {
    autoId: auto.id,
    descripcion: `${auto.marca} ${auto.modelo} ${auto.anio}`,
    moneda,
    precio: convertir(auto.precioUsd, moneda),
    impuestoDeLujo: convertir(impuestoUsd, moneda),
    seguro: convertir(seguroUsd, moneda),
    total: convertir(totalUsd, moneda),
    anticipo: convertir(anticipoUsd, moneda),
    financiado: convertir(financiadoUsd, moneda),
    meses,
    cuota: meses > 0 ? convertir(financiadoUsd / meses, moneda) : 0,
  };
}

export function resumirMarca(marca, autos) {
  const precios = autos.map((a) => a.precioUsd);
  const total = precios.reduce((suma, p) => suma + p, 0);
  return {
    marca,
    modelos: autos.length,
    disponibles: autos.filter((a) => a.disponible).length,
    precioMinimoUsd: Math.min(...precios),
    precioMaximoUsd: Math.max(...precios),
    precioPromedioUsd: Math.round(total / autos.length),
    potenciaMaximaHp: Math.max(...autos.map((a) => a.potenciaHp)),
  };
}
