import { ARMAS, CONSUMIBLES, ESTADOS, JUGADOR, MAPA, ZONA } from '../constants/juego.js';
import { crear } from './errores/index.js';
import { aparicionEnCirculo, dentroDeLaZona, dentroDelMapa, distancia } from './geometria.js';

const esArma = (tipo) => Object.hasOwn(ARMAS, tipo);

export class Partida {
  #eventos = [];
  #reloj;
  #aparicion;
  #plantillaLoot;

  constructor({
    id,
    nombre,
    capacidad,
    minimo,
    creadaEn,
    reloj = () => new Date(),
    aparicion = aparicionEnCirculo,
    plantillaLoot = [],
  }) {
    this.id = id;
    this.nombre = nombre;
    this.capacidad = capacidad;
    this.minimo = minimo;
    this.estado = ESTADOS.ABIERTA;
    this.creadaEn = creadaEn ?? reloj().toISOString();
    this.jugadores = new Map();
    this.zona = { fase: 1, radio: ZONA.radios[0], centro: { ...MAPA.centro } };
    this.loot = [];
    this.ganadorId = null;
    this.#reloj = reloj;
    this.#aparicion = aparicion;
    this.#plantillaLoot = plantillaLoot;
  }

  get vivos() {
    return [...this.jugadores.values()].filter((jugador) => jugador.vivo);
  }

  unirse(jugador, { partidaActivaId = null } = {}) {
    this.#requerirAbierta();
    if (jugador.suspendido) throw crear('JUGADOR_SUSPENDIDO', { jugadorId: jugador.id });
    if (this.jugadores.has(jugador.id)) {
      throw crear('JUGADOR_YA_INSCRITO', { jugadorId: jugador.id, partidaId: this.id });
    }
    if (partidaActivaId !== null && partidaActivaId !== this.id) {
      throw crear('JUGADOR_EN_OTRA_PARTIDA', { jugadorId: jugador.id, partidaId: partidaActivaId });
    }
    if (this.jugadores.size >= this.capacidad) {
      throw crear('PARTIDA_LLENA', { inscritos: this.jugadores.size, capacidad: this.capacidad });
    }
    const participante = {
      id: jugador.id,
      nick: jugador.nick,
      x: null,
      y: null,
      vida: JUGADOR.vidaMaxima,
      escudo: 0,
      municion: JUGADOR.municionInicial,
      inventario: [],
      vivo: true,
      eliminaciones: 0,
      puesto: null,
      eliminadoPor: null,
    };
    this.jugadores.set(jugador.id, participante);
    this.#registrar('unirse', { jugadorId: jugador.id });
    return participante;
  }

  salir(jugadorId) {
    this.#requerirAbierta();
    this.#participante(jugadorId);
    this.jugadores.delete(jugadorId);
    this.#registrar('salir', { jugadorId });
  }

  iniciar() {
    this.#requerirAbierta();
    if (this.jugadores.size < this.minimo) {
      throw crear('JUGADORES_INSUFICIENTES', {
        minimo: this.minimo,
        inscritos: this.jugadores.size,
        faltan: this.minimo - this.jugadores.size,
      });
    }
    const puntos = this.#aparicion(this.jugadores.size, { centro: MAPA.centro, radio: MAPA.radioAparicion });
    [...this.jugadores.values()].forEach((jugador, i) => {
      jugador.x = puntos[i].x;
      jugador.y = puntos[i].y;
    });
    this.loot = this.#plantillaLoot.map((objeto) => ({ ...objeto, recogidoPor: null }));
    this.estado = ESTADOS.EN_CURSO;
    this.#registrar('iniciar', { jugadores: this.jugadores.size });
  }

  mover(jugadorId, destino) {
    const jugador = this.#actuante(jugadorId);
    if (!dentroDelMapa(destino, MAPA)) {
      throw crear('FUERA_DE_MAPA', { x: destino.x, y: destino.y, ancho: MAPA.ancho, alto: MAPA.alto });
    }
    const recorrido = distancia(jugador, destino);
    if (recorrido > JUGADOR.pasoMaximo) {
      throw crear('MOVIMIENTO_DEMASIADO_LARGO', { distancia: recorrido, maximo: JUGADOR.pasoMaximo });
    }
    jugador.x = destino.x;
    jugador.y = destino.y;
    this.#registrar('mover', { jugadorId, x: destino.x, y: destino.y });
    return { x: jugador.x, y: jugador.y, dentroDeLaZona: dentroDeLaZona(jugador, this.zona) };
  }

  recoger(jugadorId, objetoId) {
    const jugador = this.#actuante(jugadorId);
    const objeto = this.loot.find((item) => item.id === objetoId);
    if (!objeto) throw crear('OBJETO_NO_ENCONTRADO', { objetoId });
    if (objeto.recogidoPor !== null) {
      throw crear('OBJETO_YA_RECOGIDO', { objetoId, recogidoPor: objeto.recogidoPor });
    }
    const lejania = distancia(jugador, objeto);
    if (lejania > JUGADOR.alcanceRecoger) {
      throw crear('OBJETO_LEJOS', { distancia: lejania, alcance: JUGADOR.alcanceRecoger });
    }
    this.#aplicarObjeto(jugador, objeto.tipo);
    objeto.recogidoPor = jugadorId;
    this.#registrar('recoger', { jugadorId, objetoId, objeto: objeto.tipo });
    return this.#resumen(jugador);
  }

  disparar(atacanteId, objetivoId, armaPedida) {
    const atacante = this.#actuante(atacanteId);
    if (atacanteId === objetivoId) throw crear('AUTO_ATAQUE');
    const objetivo = this.#participante(objetivoId);
    if (!objetivo.vivo) throw crear('OBJETIVO_ELIMINADO', { objetivoId });
    const arma = this.#elegirArma(atacante, armaPedida);
    if (atacante.municion < 1) throw crear('SIN_MUNICION', { jugadorId: atacanteId });
    const lejania = distancia(atacante, objetivo);
    if (lejania > ARMAS[arma].alcance) {
      throw crear('FUERA_DE_ALCANCE', { distancia: lejania, alcance: ARMAS[arma].alcance, arma });
    }
    atacante.municion -= 1;
    const dano = ARMAS[arma].dano;
    const absorbido = Math.min(objetivo.escudo, dano);
    objetivo.escudo -= absorbido;
    objetivo.vida = Math.max(0, objetivo.vida - (dano - absorbido));
    const eliminado = objetivo.vida === 0;
    this.#registrar('disparar', { atacanteId, objetivoId, arma, dano, eliminado });
    if (eliminado) {
      atacante.eliminaciones += 1;
      this.#eliminar(objetivo, atacanteId);
    }
    return { arma, dano, objetivo: this.#resumen(objetivo), eliminado, ganadorId: this.ganadorId };
  }

  curar(jugadorId) {
    const jugador = this.#actuante(jugadorId);
    const posicion = jugador.inventario.indexOf('botiquin');
    if (posicion === -1) throw crear('SIN_BOTIQUIN', { jugadorId });
    if (jugador.vida >= JUGADOR.vidaMaxima) throw crear('VIDA_COMPLETA', { vidaMaxima: JUGADOR.vidaMaxima });
    jugador.inventario.splice(posicion, 1);
    jugador.vida = Math.min(JUGADOR.vidaMaxima, jugador.vida + CONSUMIBLES.botiquin.cura);
    this.#registrar('curar', { jugadorId, vida: jugador.vida });
    return this.#resumen(jugador);
  }

  avanzarZona() {
    this.#requerirEnCurso();
    if (this.zona.fase >= ZONA.radios.length) throw crear('ZONA_FINAL', { fase: this.zona.fase });
    this.zona.fase += 1;
    this.zona.radio = ZONA.radios[this.zona.fase - 1];
    const dano = ZONA.danoBase * (this.zona.fase - 1);
    const afectados = [];
    for (const jugador of this.vivos) {
      if (this.estado === ESTADOS.TERMINADA) break;
      if (dentroDeLaZona(jugador, this.zona)) continue;
      jugador.vida = Math.max(0, jugador.vida - dano);
      afectados.push({ jugadorId: jugador.id, vida: jugador.vida });
      if (jugador.vida === 0) this.#eliminar(jugador, 'zona');
    }
    this.#registrar('zona', { fase: this.zona.fase, radio: this.zona.radio, dano, afectados: afectados.length });
    return { zona: { ...this.zona }, dano, afectados, ganadorId: this.ganadorId };
  }

  eventos() {
    return this.#eventos.map((evento) => ({ ...evento }));
  }

  aJSON({ detalle = false } = {}) {
    const base = {
      id: this.id,
      nombre: this.nombre,
      estado: this.estado,
      capacidad: this.capacidad,
      minimo: this.minimo,
      inscritos: this.jugadores.size,
      vivos: this.estado === ESTADOS.ABIERTA ? this.jugadores.size : this.vivos.length,
      ganadorId: this.ganadorId,
      creadaEn: this.creadaEn,
    };
    if (!detalle) return base;
    return {
      ...base,
      zona: { ...this.zona, centro: { ...this.zona.centro } },
      jugadores: [...this.jugadores.values()].map((jugador) => this.#resumen(jugador)),
      loot: this.loot.map((objeto) => ({ ...objeto })),
    };
  }

  #resumen(jugador) {
    return { ...jugador, inventario: [...jugador.inventario] };
  }

  #registrar(tipo, datos) {
    this.#eventos.push({ n: this.#eventos.length + 1, en: this.#reloj().toISOString(), ...datos, tipo });
  }

  #requerirAbierta() {
    if (this.estado !== ESTADOS.ABIERTA) throw crear('PARTIDA_NO_ABIERTA', { estado: this.estado });
  }

  #requerirEnCurso() {
    if (this.estado === ESTADOS.ABIERTA) throw crear('PARTIDA_NO_EN_CURSO');
    if (this.estado === ESTADOS.TERMINADA) throw crear('PARTIDA_TERMINADA', { ganadorId: this.ganadorId });
  }

  #participante(jugadorId) {
    const jugador = this.jugadores.get(jugadorId);
    if (!jugador) throw crear('JUGADOR_NO_PARTICIPA', { jugadorId, partidaId: this.id });
    return jugador;
  }

  #actuante(jugadorId) {
    this.#requerirEnCurso();
    const jugador = this.#participante(jugadorId);
    if (!jugador.vivo) throw crear('JUGADOR_ELIMINADO', { jugadorId });
    return jugador;
  }

  #elegirArma(jugador, armaPedida) {
    const armas = jugador.inventario.filter(esArma);
    if (armaPedida) {
      if (!armas.includes(armaPedida)) {
        throw crear('ARMA_NO_EQUIPADA', { jugadorId: jugador.id, arma: armaPedida });
      }
      return armaPedida;
    }
    if (armas.length === 0) throw crear('SIN_ARMA', { jugadorId: jugador.id });
    return armas.reduce((mejor, actual) => (ARMAS[actual].dano > ARMAS[mejor].dano ? actual : mejor));
  }

  #aplicarObjeto(jugador, tipo) {
    if (tipo === 'escudo') {
      if (jugador.escudo >= JUGADOR.escudoMaximo) {
        throw crear('ESCUDO_COMPLETO', { escudoMaximo: JUGADOR.escudoMaximo });
      }
      jugador.escudo = Math.min(JUGADOR.escudoMaximo, jugador.escudo + CONSUMIBLES.escudo.puntos);
      return;
    }
    if (tipo === 'municion') {
      if (jugador.municion >= JUGADOR.municionMaxima) {
        throw crear('MUNICION_LLENA', { municionMaxima: JUGADOR.municionMaxima });
      }
      jugador.municion = Math.min(JUGADOR.municionMaxima, jugador.municion + CONSUMIBLES.municion.balas);
      return;
    }
    if (jugador.inventario.length >= JUGADOR.espaciosInventario) {
      throw crear('INVENTARIO_LLENO', {
        ocupados: jugador.inventario.length,
        espacios: JUGADOR.espaciosInventario,
      });
    }
    if (esArma(tipo) && jugador.inventario.includes(tipo)) throw crear('ARMA_REPETIDA', { arma: tipo });
    jugador.inventario.push(tipo);
  }

  #eliminar(jugador, causa) {
    jugador.vivo = false;
    jugador.vida = 0;
    jugador.puesto = this.vivos.length + 1;
    jugador.eliminadoPor = causa;
    this.#registrar('eliminacion', { jugadorId: jugador.id, por: causa, puesto: jugador.puesto });
    if (this.vivos.length <= 1) {
      this.estado = ESTADOS.TERMINADA;
      this.ganadorId = this.vivos[0]?.id ?? null;
      this.#registrar('fin', { ganadorId: this.ganadorId });
    }
  }
}
