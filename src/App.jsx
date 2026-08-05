import React, { useState, useEffect, useMemo } from "react";
import {
  Dumbbell, Plane, TrendingUp, Scale, User, Check, ChevronDown,
  RefreshCw, Plus, Trash2, Flame, Trophy, Calendar, Timer, Youtube,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ---------------------------------------------------------------
   PALETA — cores de anilhas olímpicas (25/20/15/10/5 kg)
--------------------------------------------------------------- */
const C = {
  bg: "#15161A",
  bg2: "#1C1E24",
  card: "#22252C",
  line: "#31353F",
  txt: "#EDEBE6",
  mut: "#8B8F9A",
  bar: "#6E7178",
  p25: "#D6342C",
  p20: "#1E63C8",
  p15: "#E5A812",
  p10: "#17925B",
  p5: "#E4E1D9",
  travel: "#C77DFF",
};

const GRUPOS = {
  peito:  { nome: "Peito",   cor: C.p25, alt: 78 },
  costas: { nome: "Costas",  cor: C.p20, alt: 72 },
  pernas: { nome: "Pernas",  cor: C.p15, alt: 66 },
  ombros: { nome: "Ombros",  cor: C.p10, alt: 60 },
  bracos: { nome: "Braços",  cor: C.p5,  alt: 54 },
};

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/* ---------------------------------------------------------------
   BANCO DE EXERCÍCIOS — adaptado aos aparelhos da Smart Fit
   (Matrix/Life Fitness: máquinas guiadas, crossover, gravitron,
   leg press, hack, cadeiras e halteres. Muitas unidades não têm
   rack para agachamento livre/terra com barra olímpica, por isso
   priorizamos Smith, hack e máquinas guiadas nesses movimentos.)
   t: C = composto, I = isolado | sub: bi/tri para braços
   eq: maquina = aparelho guiado/cabo | halteres | livre = barra livre | corpo
--------------------------------------------------------------- */
const POOL = {
  peito: [
    { n: "Supino reto máquina", t: "C", eq: "maquina" },
    { n: "Supino no Smith", t: "C", eq: "maquina" },
    { n: "Mergulho no gravitron (assistido)", t: "C", eq: "maquina" },
    { n: "Supino inclinado com halteres", t: "C", eq: "halteres" },
    { n: "Supino reto com halteres", t: "C", eq: "halteres" },
    { n: "Flexão de braço", t: "C", eq: "corpo" },
    { n: "Crossover na polia alta", t: "I", eq: "maquina" },
    { n: "Peck deck (voador)", t: "I", eq: "maquina" },
    { n: "Crossover na polia baixa", t: "I", eq: "maquina" },
    { n: "Pullover na polia alta", t: "I", eq: "maquina" },
    { n: "Crucifixo com halteres", t: "I", eq: "halteres" },
    { n: "Crucifixo inclinado com halteres", t: "I", eq: "halteres" },
  ],
  costas: [
    { n: "Puxada frontal na polia (pulldown)", t: "C", eq: "maquina" },
    { n: "Puxada supinada na polia", t: "C", eq: "maquina" },
    { n: "Barra fixa no gravitron (assistida)", t: "C", eq: "maquina" },
    { n: "Remada baixa no cabo (triângulo)", t: "C", eq: "maquina" },
    { n: "Remada máquina articulada", t: "C", eq: "maquina" },
    { n: "Remada cavalinho na polia", t: "C", eq: "maquina" },
    { n: "Remada unilateral com halter", t: "C", eq: "halteres" },
    { n: "Pulldown com braços estendidos", t: "I", eq: "maquina" },
    { n: "Pullover na polia alta", t: "I", eq: "maquina" },
    { n: "Face pull na polia", t: "I", eq: "maquina" },
    { n: "Hiperextensão (banco lombar)", t: "I", eq: "maquina" },
    { n: "Encolhimento com halteres", t: "I", eq: "halteres" },
  ],
  pernas: [
    { n: "Leg press 45°", t: "C", eq: "maquina" },
    { n: "Hack machine", t: "C", eq: "maquina" },
    { n: "Agachamento no Smith", t: "C", eq: "maquina" },
    { n: "Elevação pélvica (hip thrust)", t: "C", eq: "maquina" },
    { n: "Afundo com halteres", t: "C", eq: "halteres" },
    { n: "Cadeira extensora", t: "I", eq: "maquina" },
    { n: "Mesa flexora", t: "I", eq: "maquina" },
    { n: "Cadeira flexora", t: "I", eq: "maquina" },
    { n: "Panturrilha em pé (máquina)", t: "I", eq: "maquina" },
    { n: "Panturrilha sentado (máquina)", t: "I", eq: "maquina" },
    { n: "Cadeira abdutora", t: "I", eq: "maquina" },
    { n: "Cadeira adutora", t: "I", eq: "maquina" },
  ],
  ombros: [
    { n: "Desenvolvimento máquina", t: "C", eq: "maquina" },
    { n: "Desenvolvimento no Smith", t: "C", eq: "maquina" },
    { n: "Remada alta na polia", t: "C", eq: "maquina" },
    { n: "Desenvolvimento com halteres", t: "C", eq: "halteres" },
    { n: "Elevação lateral na polia", t: "I", eq: "maquina" },
    { n: "Crucifixo inverso (peck deck invertido)", t: "I", eq: "maquina" },
    { n: "Face pull na polia", t: "I", eq: "maquina" },
    { n: "Encolhimento na polia", t: "I", eq: "maquina" },
    { n: "Elevação lateral com halteres", t: "I", eq: "halteres" },
    { n: "Elevação frontal com halter", t: "I", eq: "halteres" },
  ],
  bracos: [
    { n: "Rosca Scott no cabo (banco Scott)", t: "C", eq: "maquina", sub: "bi" },
    { n: "Rosca inversa no cabo", t: "I", eq: "maquina", sub: "bi" },
    { n: "Rosca direta com barra", t: "C", eq: "livre", sub: "bi" },
    { n: "Rosca alternada com halteres", t: "C", eq: "halteres", sub: "bi" },
    { n: "Rosca martelo com halteres", t: "I", eq: "halteres", sub: "bi" },
    { n: "Rosca concentrada", t: "I", eq: "halteres", sub: "bi" },
    { n: "Tríceps máquina (aparelho guiado)", t: "C", eq: "maquina", sub: "tri" },
    { n: "Tríceps pulley com barra", t: "C", eq: "maquina", sub: "tri" },
    { n: "Mergulho no gravitron (assistido)", t: "C", eq: "maquina", sub: "tri" },
    { n: "Tríceps corda na polia", t: "I", eq: "maquina", sub: "tri" },
    { n: "Tríceps testa com halteres", t: "I", eq: "halteres", sub: "tri" },
    { n: "Tríceps francês com halter", t: "I", eq: "halteres", sub: "tri" },
  ],
};

/* Modo viagem — separado por equipamento disponível */
const VIAGEM = {
  nenhum: [
    { n: "Flexão de braço", alvo: "Peito" },
    { n: "Flexão diamante", alvo: "Tríceps" },
    { n: "Flexão inclinada (pés na cama)", alvo: "Peito alto" },
    { n: "Pike push-up", alvo: "Ombros" },
    { n: "Agachamento livre", alvo: "Pernas" },
    { n: "Agachamento búlgaro", alvo: "Pernas" },
    { n: "Afundo caminhando", alvo: "Pernas" },
    { n: "Ponte de glúteo", alvo: "Glúteo" },
    { n: "Panturrilha em pé (unilateral)", alvo: "Panturrilha" },
    { n: "Remada invertida na mesa", alvo: "Costas" },
    { n: "Superman", alvo: "Lombar" },
    { n: "Mergulho na cadeira", alvo: "Tríceps" },
    { n: "Prancha", alvo: "Core" },
    { n: "Mountain climber", alvo: "Core" },
    { n: "Burpee", alvo: "Corpo todo" },
    { n: "Abdominal remador", alvo: "Core" },
  ],
  halteres: [
    { n: "Supino com halteres no chão", alvo: "Peito" },
    { n: "Crucifixo com halteres", alvo: "Peito" },
    { n: "Remada unilateral com halter", alvo: "Costas" },
    { n: "Remada curvada com halteres", alvo: "Costas" },
    { n: "Desenvolvimento com halteres", alvo: "Ombros" },
    { n: "Elevação lateral", alvo: "Ombros" },
    { n: "Agachamento goblet", alvo: "Pernas" },
    { n: "Afundo com halteres", alvo: "Pernas" },
    { n: "Terra romeno com halteres", alvo: "Posterior" },
    { n: "Rosca alternada", alvo: "Bíceps" },
    { n: "Rosca martelo", alvo: "Bíceps" },
    { n: "Tríceps francês", alvo: "Tríceps" },
    { n: "Tríceps coice", alvo: "Tríceps" },
    { n: "Encolhimento com halteres", alvo: "Trapézio" },
    { n: "Flexão de braço", alvo: "Peito" },
    { n: "Prancha", alvo: "Core" },
  ],
  completa: [
    { n: "Supino com halteres", alvo: "Peito" },
    { n: "Puxada frontal na polia", alvo: "Costas" },
    { n: "Remada baixa", alvo: "Costas" },
    { n: "Leg press", alvo: "Pernas" },
    { n: "Agachamento goblet", alvo: "Pernas" },
    { n: "Desenvolvimento com halteres", alvo: "Ombros" },
    { n: "Elevação lateral", alvo: "Ombros" },
    { n: "Crucifixo com halteres", alvo: "Peito" },
    { n: "Cadeira extensora", alvo: "Quadríceps" },
    { n: "Mesa flexora", alvo: "Posterior" },
    { n: "Rosca direta", alvo: "Bíceps" },
    { n: "Tríceps na polia", alvo: "Tríceps" },
    { n: "Remada unilateral com halter", alvo: "Costas" },
    { n: "Panturrilha em pé", alvo: "Panturrilha" },
    { n: "Prancha", alvo: "Core" },
  ],
};

/* ---------------------------------------------------------------
   MOTOR DE ROTINAS
--------------------------------------------------------------- */
function girar(arr, n) {
  const k = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

// escolhe `qtd` exercícios de um pool, priorizando máquina antes de
// completar com halteres/barra livre/corpo — só sai da máquina se
// não houver opções suficientes ali dentro
function selecionar(pool, ciclo, qtd, preferMaquina) {
  if (qtd <= 0) return [];
  if (!preferMaquina) return girar(pool, ciclo * qtd).slice(0, qtd);

  const maq = pool.filter((e) => e.eq === "maquina");
  const outros = pool.filter((e) => e.eq !== "maquina");
  const selMaq = maq.length ? girar(maq, ciclo * qtd).slice(0, Math.min(qtd, maq.length)) : [];
  const falta = qtd - selMaq.length;
  if (falta <= 0) return selMaq;
  const selOutros = outros.length ? girar(outros, ciclo * falta).slice(0, falta) : [];
  return [...selMaq, ...selOutros];
}

/* ---------------------------------------------------------------
   OBJETIVOS — cada um pesa diferente em reps/séries/descanso
--------------------------------------------------------------- */
const OBJETIVOS = {
  emagrecimento: {
    label: "Emagrecimento", cor: C.p20,
    resumo: "Descanso curto e reps altas — mais densidade pra gastar caloria",
    C: { reps: "15-20", series: 3, desc: 30 },
    I: { reps: "15-20", series: 3, desc: 30 },
  },
  definicao: {
    label: "Definição", cor: C.p15,
    resumo: "Reps moderadas-altas — mantém músculo enquanto perde gordura",
    C: { reps: "12-15", series: 3, desc: 45 },
    I: { reps: "12-15", series: 3, desc: 45 },
  },
  hipertrofia: {
    label: "Ganho de massa", cor: C.p25,
    resumo: "Faixa clássica de hipertrofia — volume moderado, carga alta",
    C: { reps: "8-12", series: 4, desc: 90 },
    I: { reps: "10-15", series: 3, desc: 60 },
  },
  forca: {
    label: "Força", cor: C.p10,
    resumo: "Poucas reps, carga alta, descanso longo",
    C: { reps: "4-6", series: 5, desc: 180 },
    I: { reps: "8-10", series: 3, desc: 90 },
  },
  resistencia: {
    label: "Resistência", cor: C.p5,
    resumo: "Reps muito altas — foco em fôlego muscular, não em carga",
    C: { reps: "15-20", series: 3, desc: 30 },
    I: { reps: "20-25", series: 3, desc: 25 },
  },
};
const LISTA_OBJETIVOS = Object.entries(OBJETIVOS).map(([id, o]) => [id, o.label]);

function prescricao(tipo, objetivo, idade) {
  const cfg = (OBJETIVOS[objetivo] || OBJETIVOS.hipertrofia)[tipo];
  let { reps, series, desc } = cfg;
  const veterano = idade >= 45;
  if (veterano) {
    desc += 30;
    if (objetivo === "forca" && tipo === "C") reps = "5-8";
  }
  return { reps, series, desc };
}

// tempo médio de execução de 1 série, incluindo troca de carga/ajuste de banco
const EXEC_C = 45; // composto: mais setup (barra, ajuste de banco)
const EXEC_I = 30; // isolado: mais rápido de ajustar

function custoExercicio(tipo, objetivo, idade) {
  const { series, desc } = prescricao(tipo, objetivo, idade);
  const exec = tipo === "C" ? EXEC_C : EXEC_I;
  return series * exec + series * desc; // execução + descanso de cada série
}

function aquecimentoPara(minutos) {
  return minutos >= 40 ? 240 : minutos >= 25 ? 150 : 70;
}

// decide quantos exercícios compostos/isolados cabem no tempo disponível
function calcQtdExercicios(minutos, objetivo, idade, nivel) {
  const budget = Math.max(300, minutos * 60 - aquecimentoPara(minutos));
  const cC = custoExercicio("C", objetivo, idade);
  const cI = custoExercicio("I", objetivo, idade);
  const tetoNivel = nivel === "avancado" ? 7 : nivel === "iniciante" ? 5 : 6;

  let nC = 0, nI = 0, usado = 0, total = 0, vezComposto = true;
  while (total < tetoNivel) {
    const custo = vezComposto ? cC : cI;
    const cabe = usado + custo <= budget;
    const minimoGarantido = total < 2; // sempre tenta fechar pelo menos 2 exercícios
    if (!cabe && !minimoGarantido) break;
    usado += custo;
    vezComposto ? nC++ : nI++;
    total++;
    vezComposto = !vezComposto;
    if (!cabe) break; // usou o mínimo garantido mas já estourou — para aqui
  }
  return { nC: Math.max(nC, 1), nI };
}

// soma o tempo estimado (min) de uma lista de exercícios já montada
function estimarMinutos(exercicios, minutosBase) {
  const seg = exercicios.reduce((a, e) => {
    const exec = e.tipo === "I" ? EXEC_I : EXEC_C;
    return a + e.series * exec + e.series * e.desc;
  }, 0);
  return Math.round((seg + aquecimentoPara(minutosBase)) / 60);
}

function montarTreino(grupo, ciclo, nivel, objetivo, idade, minutos = 30, preferMaquina = true) {
  const pool = POOL[grupo];
  const { nC, nI } = calcQtdExercicios(minutos, objetivo, idade, nivel);

  let escolhidos = [];
  if (grupo === "bracos") {
    const metade = Math.max(1, Math.round((nC + nI) / 2));
    ["bi", "tri"].forEach((s, i) => {
      const sub = pool.filter((e) => e.sub === s);
      escolhidos.push(...selecionar(sub, ciclo + i, metade, preferMaquina));
    });
    // intercala bíceps e tríceps
    const bi = escolhidos.filter((e) => e.sub === "bi");
    const tri = escolhidos.filter((e) => e.sub === "tri");
    escolhidos = bi.flatMap((e, i) => (tri[i] ? [e, tri[i]] : [e]));
  } else {
    const comp = pool.filter((e) => e.t === "C");
    const isol = pool.filter((e) => e.t === "I");
    escolhidos = [
      ...selecionar(comp, ciclo, nC, preferMaquina),
      ...selecionar(isol, ciclo, nI, preferMaquina),
    ];
  }

  return escolhidos.map((e) => ({ nome: e.n, tipo: e.t, eq: e.eq, ...prescricao(e.t, objetivo, idade) }));
}

function montarViagem(equip, minutos, ciclo, objetivo, idade) {
  const pool = VIAGEM[equip];
  const qtd = minutos <= 20 ? 4 : minutos <= 30 ? 6 : 8;
  const sel = girar(pool, ciclo * qtd).slice(0, qtd);
  const series = minutos <= 20 ? 3 : 4;
  const repsPorObjetivo = {
    forca: "8-10", hipertrofia: "10-15", definicao: "12-15",
    emagrecimento: "15-20", resistencia: "18-22",
  };
  const reps = equip === "nenhum" ? "15-20" : (repsPorObjetivo[objetivo] || "10-15");
  const curto = objetivo === "emagrecimento" || objetivo === "resistencia";
  const desc = curto ? 25 : minutos <= 20 ? 30 : idade >= 45 ? 75 : 60;
  return sel.map((e) => ({ nome: e.n, alvo: e.alvo, series, reps, desc }));
}

/* ---------------------------------------------------------------
   ARMAZENAMENTO
   Usa window.storage dentro do preview do Claude; fora daqui
   (app publicado, ex. Vercel) cai automaticamente pro localStorage
   do navegador, que é o que persiste os dados no celular.
--------------------------------------------------------------- */
const temStorageClaude = typeof window !== "undefined" && !!window.storage;

const store = {
  async get(key, fb) {
    try {
      if (temStorageClaude) {
        const r = await window.storage.get(key);
        return r && r.value ? JSON.parse(r.value) : fb;
      }
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fb;
    } catch {
      return fb;
    }
  },
  async set(key, val) {
    try {
      if (temStorageClaude) {
        await window.storage.set(key, JSON.stringify(val));
      } else {
        localStorage.setItem(key, JSON.stringify(val));
      }
    } catch (e) {
      console.error("Falha ao salvar", key, e);
    }
  },
  async delete(key) {
    try {
      if (temStorageClaude) {
        await window.storage.delete(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error("Falha ao apagar", key, e);
    }
  },
};

/* ---------------------------------------------------------------
   UTILIDADES
--------------------------------------------------------------- */
const hoje = () => new Date().toISOString().slice(0, 10);
const fmtData = (iso) => {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}`;
};
function inicioSemana(iso) {
  const d = new Date(iso + "T12:00:00");
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}
const nfmt = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

// monta um link de busca no YouTube filtrado por vídeos curtos (< 4 min)
function linkYoutube(nomeExercicio) {
  const q = encodeURIComponent(`${nomeExercicio} como fazer execução`);
  return `https://www.youtube.com/results?search_query=${q}&sp=EgIYAQ%3D%3D`;
}

/* ---------------------------------------------------------------
   CSS
--------------------------------------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.gym * { box-sizing: border-box; }
.gym {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  background: ${C.bg}; color: ${C.txt};
  min-height: 100vh; width: 100%;
  padding-bottom: 84px;
  -webkit-font-smoothing: antialiased;
}
.gym h1,.gym h2,.gym h3 { margin: 0; }
.disp { font-family: 'Anton', Impact, sans-serif; letter-spacing: .02em; text-transform: uppercase; font-weight: 400; }
.mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
.wrap { max-width: 620px; margin: 0 auto; padding: 0 16px; }

.eyebrow { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: ${C.mut}; font-weight: 600; }

.card { background: ${C.card}; border: 1px solid ${C.line}; border-radius: 14px; }

/* --- rack de anilhas (a semana) --- */
.rack { position: relative; display: flex; align-items: center; justify-content: space-between; height: 96px; padding: 0 4px; }
.rack-bar { position: absolute; left: 0; right: 0; top: 50%; height: 7px; margin-top: -14px; background: linear-gradient(${C.bar}, #4A4D55); border-radius: 4px; }
.plate-col { position: relative; background: none; border: 0; padding: 0; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 7px; flex: 1; -webkit-tap-highlight-color: transparent; }
.plate { width: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease; }
.plate span { font-family: 'Anton', sans-serif; font-size: 13px; color: rgba(0,0,0,.55); transform: rotate(-90deg); }
.plate-col[data-on="0"] .plate { opacity: .3; }
.plate-col[data-hoje="1"] .plate { transform: scale(1.1); box-shadow: 0 0 0 3px ${C.bg}, 0 0 0 5px currentColor; }
.plate-lbl { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: ${C.mut}; font-weight: 600; }
.plate-col[data-hoje="1"] .plate-lbl { color: ${C.txt}; }

/* --- botões --- */
.btn { font-family: inherit; font-size: 14px; font-weight: 600; border-radius: 11px; border: 1px solid ${C.line};
       background: ${C.card}; color: ${C.txt}; padding: 12px 16px; cursor: pointer; transition: .15s;
       display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.btn:hover { border-color: #4A4F5A; }
.btn-full { width: 100%; }
.btn-p { background: ${C.txt}; color: ${C.bg}; border-color: ${C.txt}; }
.btn-p:hover { background: #fff; }
.btn-sm { padding: 8px 12px; font-size: 13px; border-radius: 9px; }
.btn:focus-visible, .chip:focus-visible, input:focus-visible { outline: 2px solid ${C.p15}; outline-offset: 2px; }

.chip { font-family: inherit; font-size: 13px; font-weight: 500; padding: 9px 13px; border-radius: 999px;
        border: 1px solid ${C.line}; background: ${C.bg2}; color: ${C.mut}; cursor: pointer; transition: .15s; }
.chip[data-on="1"] { background: ${C.txt}; color: ${C.bg}; border-color: ${C.txt}; }

input.f { font-family: 'IBM Plex Mono', monospace; background: ${C.bg2}; border: 1px solid ${C.line};
          color: ${C.txt}; border-radius: 10px; padding: 11px 12px; font-size: 15px; width: 100%; }
input.f::placeholder { color: #5C606B; }

/* --- exercício --- */
.ex { border-bottom: 1px solid ${C.line}; }
.ex:last-child { border-bottom: 0; }
.ex-top { display: flex; align-items: center; gap: 12px; padding: 14px 15px; cursor: pointer; }
.ex-num { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: ${C.mut}; width: 18px; flex-shrink: 0; }
.ex-nome { font-size: 15px; font-weight: 600; line-height: 1.25; }
.ex-meta { font-size: 12px; color: ${C.mut}; margin-top: 3px; font-family: 'IBM Plex Mono', monospace; }
.ex-body { padding: 0 15px 15px 45px; }
.serie-row { display: grid; grid-template-columns: 26px 1fr 1fr 42px; gap: 8px; align-items: center; margin-bottom: 8px; }
.serie-n { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: ${C.mut}; }
.chk { width: 40px; height: 40px; border-radius: 10px; border: 1px solid ${C.line}; background: ${C.bg2};
       display: flex; align-items: center; justify-content: center; cursor: pointer; }
.chk[data-on="1"] { background: ${C.p10}; border-color: ${C.p10}; }

/* --- navegação --- */
.nav { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(21,22,26,.94);
       backdrop-filter: blur(12px); border-top: 1px solid ${C.line}; display: flex; z-index: 20;
       padding-bottom: env(safe-area-inset-bottom); }
.nav button { flex: 1; background: none; border: 0; padding: 11px 0 13px; color: ${C.mut}; cursor: pointer;
              display: flex; flex-direction: column; align-items: center; gap: 4px; font-family: inherit; font-size: 10px;
              font-weight: 600; letter-spacing: .05em; text-transform: uppercase; transition: .15s; }
.nav button[data-on="1"] { color: ${C.txt}; }

.stat { padding: 13px; text-align: left; }
.stat-v { font-family: 'Anton', sans-serif; font-size: 26px; line-height: 1; }
.stat-l { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: ${C.mut}; margin-top: 6px; font-weight: 600; }

.banner { border-radius: 14px; padding: 13px 15px; display: flex; gap: 11px; align-items: center; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.grid3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }

.vid-btn { width: 34px; height: 34px; border-radius: 9px; border: 1px solid ${C.line}; background: ${C.bg2};
           display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: .15s;
           text-decoration: none; color: inherit; }
.vid-btn:hover { border-color: #D93025; color: #D93025; }

@media (prefers-reduced-motion: reduce) { .gym * { transition: none !important; } }
`;

/* ---------------------------------------------------------------
   APP
--------------------------------------------------------------- */
export default function App() {
  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [treinos, setTreinos] = useState([]);
  const [pesos, setPesos] = useState([]);
  const [aba, setAba] = useState("treino");

  useEffect(() => {
    (async () => {
      const [p, t, w] = await Promise.all([
        store.get("gym:perfil", null),
        store.get("gym:treinos", []),
        store.get("gym:pesos", []),
      ]);
      setPerfil(p);
      setTreinos(t || []);
      setPesos(w || []);
      setCarregando(false);
    })();
  }, []);

  const salvarPerfil = (p) => { setPerfil(p); store.set("gym:perfil", p); };
  const salvarTreinos = (t) => { setTreinos(t); store.set("gym:treinos", t); };
  const salvarPesos = (w) => { setPesos(w); store.set("gym:pesos", w); };

  return (
    <div className="gym">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {carregando ? (
        <div className="wrap" style={{ paddingTop: 80, textAlign: "center", color: C.mut }}>
          Carregando seus dados…
        </div>
      ) : !perfil ? (
        <Onboarding onPronto={salvarPerfil} />
      ) : (
        <>
          {aba === "treino" && (
            <Treino perfil={perfil} treinos={treinos} salvarTreinos={salvarTreinos} salvarPerfil={salvarPerfil} />
          )}
          {aba === "progresso" && <Progresso perfil={perfil} treinos={treinos} salvarTreinos={salvarTreinos} />}
          {aba === "peso" && <Peso perfil={perfil} pesos={pesos} salvarPesos={salvarPesos} salvarPerfil={salvarPerfil} />}
          {aba === "perfil" && (
            <Perfil perfil={perfil} salvarPerfil={salvarPerfil} salvarTreinos={salvarTreinos} salvarPesos={salvarPesos} />
          )}
          <nav className="nav">
            {[
              ["treino", "Treino", Dumbbell],
              ["progresso", "Progresso", TrendingUp],
              ["peso", "Peso", Scale],
              ["perfil", "Perfil", User],
            ].map(([id, lbl, Ico]) => (
              <button key={id} data-on={aba === id ? 1 : 0} onClick={() => setAba(id)}>
                <Ico size={19} strokeWidth={2} />
                {lbl}
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   ONBOARDING
--------------------------------------------------------------- */
function Onboarding({ onPronto }) {
  const [f, setF] = useState({
    nome: "", idade: "", peso: "", altura: "",
    nivel: "intermediario", objetivo: "hipertrofia",
    dias: [1, 2, 3, 4, 5], minutosTreino: 30, prefMaquina: true,
    ordem: ["peito", "costas", "pernas", "ombros", "bracos"],
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const toggleDia = (d) => {
    const tem = f.dias.includes(d);
    if (tem) set("dias", f.dias.filter((x) => x !== d));
    else if (f.dias.length < 5) set("dias", [...f.dias, d].sort((a, b) => a - b));
  };

  const valido = f.nome.trim().length > 0 && f.idade > 12 && f.peso > 25 && f.altura > 100 && f.dias.length === 5;

  return (
    <div className="wrap" style={{ paddingTop: 44, paddingBottom: 40 }}>
      <div className="eyebrow">Vamos montar sua ficha</div>
      <h1 className="disp" style={{ fontSize: 40, lineHeight: 0.95, marginTop: 10 }}>
        Cinco dias.<br />Um músculo<br />por vez.
      </h1>
      <p style={{ color: C.mut, fontSize: 14, lineHeight: 1.6, marginTop: 14 }}>
        Preciso de alguns dados para calcular séries, repetições e descanso. Dá para mudar tudo depois.
      </p>

      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
        <Campo label="Nome">
          <input className="f" value={f.nome} placeholder="Gustavo"
            style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
            onChange={(e) => set("nome", e.target.value)} />
        </Campo>
        <div className="grid3">
          <Campo label="Idade">
            <input className="f" inputMode="numeric" value={f.idade} placeholder="34"
              onChange={(e) => set("idade", e.target.value.replace(/\D/g, ""))} />
          </Campo>
          <Campo label="Peso (kg)">
            <input className="f" inputMode="decimal" value={f.peso} placeholder="78"
              onChange={(e) => set("peso", e.target.value.replace(",", "."))} />
          </Campo>
          <Campo label="Altura (cm)">
            <input className="f" inputMode="numeric" value={f.altura} placeholder="176"
              onChange={(e) => set("altura", e.target.value.replace(/\D/g, ""))} />
          </Campo>
        </div>

        <Campo label="Experiência">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["iniciante", "Iniciante"], ["intermediario", "Intermediário"], ["avancado", "Avançado"]].map(([v, l]) => (
              <button key={v} className="chip" data-on={f.nivel === v ? 1 : 0} onClick={() => set("nivel", v)}>{l}</button>
            ))}
          </div>
        </Campo>

        <Campo label="Objetivo">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LISTA_OBJETIVOS.map(([v, l]) => (
              <button key={v} className="chip" data-on={f.objetivo === v ? 1 : 0} onClick={() => set("objetivo", v)}>{l}</button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.mut, marginTop: 7, lineHeight: 1.5 }}>
            {OBJETIVOS[f.objetivo].resumo}
          </div>
        </Campo>

        <Campo label="Tempo disponível para musculação por dia">
          <div style={{ display: "flex", gap: 8 }}>
            {[20, 30, 45, 60].map((m) => (
              <button key={m} className="chip" style={{ flex: 1 }} data-on={f.minutosTreino === m ? 1 : 0}
                onClick={() => set("minutosTreino", m)}>{m} min</button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.mut, marginTop: 7, lineHeight: 1.5 }}>
            Sem contar o cardio — é só o tempo de musculação. Ajusto a quantidade de exercícios pra caber nisso.
          </div>
        </Campo>

        <Campo label={`Dias de treino — escolha 5 (${f.dias.length}/5)`}>
          <div style={{ display: "flex", gap: 6 }}>
            {DIAS.map((d, i) => (
              <button key={i} className="chip" style={{ flex: 1, padding: "9px 0" }}
                data-on={f.dias.includes(i) ? 1 : 0} onClick={() => toggleDia(i)}>{d}</button>
            ))}
          </div>
        </Campo>
      </div>

      <button className="btn btn-p btn-full" style={{ marginTop: 26, opacity: valido ? 1 : 0.4 }}
        disabled={!valido}
        onClick={() =>
          onPronto({
            ...f,
            nome: f.nome.trim() || "Atleta",
            idade: +f.idade, peso: +f.peso, altura: +f.altura,
            inicio: hoje(), ciclosExtras: 0,
          })
        }>
        Gerar minha rotina
      </button>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------
   ABA TREINO
--------------------------------------------------------------- */
function Treino({ perfil, treinos, salvarTreinos, salvarPerfil }) {
  const hj = new Date();
  const [diaSel, setDiaSel] = useState(hj.getDay());
  const [viagem, setViagem] = useState(false);
  const [equip, setEquip] = useState("nenhum");
  const [minutos, setMinutos] = useState(30);
  const [log, setLog] = useState({});
  const [aberto, setAberto] = useState(0);
  const [salvo, setSalvo] = useState(false);

  const ciclo = useMemo(() => {
    const dias = Math.floor((new Date(hoje()) - new Date(perfil.inicio)) / 864e5);
    return Math.max(0, Math.floor(dias / 28)) + (perfil.ciclosExtras || 0);
  }, [perfil]);

  const mapaDias = useMemo(() => {
    const m = {};
    perfil.dias.forEach((d, i) => { m[d] = perfil.ordem[i % perfil.ordem.length]; });
    return m;
  }, [perfil]);

  const grupo = mapaDias[diaSel];

  const minutosBase = viagem ? minutos : perfil.minutosTreino || 30;

  const exercicios = useMemo(() => {
    if (viagem) return montarViagem(equip, minutos, ciclo, perfil.objetivo, perfil.idade);
    if (!grupo) return [];
    return montarTreino(grupo, ciclo, perfil.nivel, perfil.objetivo, perfil.idade, perfil.minutosTreino || 30, perfil.prefMaquina !== false);
  }, [viagem, equip, minutos, grupo, ciclo, perfil]);

  const minutosEstimados = useMemo(
    () => (exercicios.length ? estimarMinutos(exercicios, minutosBase) : 0),
    [exercicios, minutosBase]
  );

  // último desempenho por exercício (série completa, pra pré-preencher)
  const ultimos = useMemo(() => {
    const m = {};
    [...treinos].sort((a, b) => a.data.localeCompare(b.data)).forEach((t) =>
      t.exercicios.forEach((e) => {
        const val = e.series.filter((s) => s.kg > 0 || s.reps > 0);
        if (val.length) m[e.nome] = { data: t.data, series: val, melhor: val.reduce((a, b) => (b.kg > a.kg ? b : a)) };
      })
    );
    return m;
  }, [treinos]);

  useEffect(() => { setSalvo(false); setAberto(0); }, [diaSel, viagem, equip, minutos]);

  // pré-preenche kg/reps com a última vez que cada exercício foi feito
  useEffect(() => {
    const inicial = {};
    exercicios.forEach((e) => {
      const ult = ultimos[e.nome];
      if (!ult) return;
      inicial[e.nome] = Array.from({ length: e.series }).map((_, i) => {
        const s = ult.series[i] || ult.series[ult.series.length - 1];
        return s ? { kg: String(s.kg), reps: String(s.reps), ok: false } : { kg: "", reps: "", ok: false };
      });
    });
    setLog(inicial);
  }, [exercicios, ultimos]);

  const setSerie = (ex, i, campo, v) =>
    setLog((s) => {
      const arr = [...(s[ex] || [])];
      arr[i] = { ...(arr[i] || { kg: "", reps: "", ok: false }), [campo]: v };
      return { ...s, [ex]: arr };
    });

  const volume = Object.values(log).flat().filter((s) => s?.ok).reduce((a, s) => a + (+s?.kg || 0) * (+s?.reps || 0), 0);
  const seriesFeitas = Object.values(log).flat().filter((s) => s?.ok).length;

  const concluir = () => {
    const exs = exercicios
      .map((e) => ({
        nome: e.nome,
        series: (log[e.nome] || []).filter((s) => s && s.ok).map((s) => ({ kg: +s.kg || 0, reps: +s.reps || 0 })),
      }))
      .filter((e) => e.series.length);
    if (!exs.length) return;
    salvarTreinos([
      ...treinos,
      { id: Date.now(), data: hoje(), grupo: viagem ? "viagem" : grupo, ciclo, viagem, exercicios: exs, volume },
    ]);
    setSalvo(true);
  };

  return (
    <div className="wrap" style={{ paddingTop: 26 }}>
      <div className="row">
        <div>
          <div className="eyebrow">Ciclo {ciclo + 1} · Semana {Math.floor(((new Date(hoje()) - new Date(perfil.inicio)) / 864e5 % 28) / 7) + 1} de 4</div>
          <h1 className="disp" style={{ fontSize: 27, marginTop: 5 }}>Olá, {perfil.nome}</h1>
        </div>
        <button className="btn btn-sm" title="Trocar exercícios agora"
          onClick={() => salvarPerfil({ ...perfil, ciclosExtras: (perfil.ciclosExtras || 0) + 1 })}>
          <RefreshCw size={14} /> Trocar
        </button>
      </div>

      {/* SIGNATURE: a semana como uma barra carregada */}
      <div className="rack" style={{ marginTop: 14 }}>
        <div className="rack-bar" />
        {DIAS.map((d, i) => {
          const g = mapaDias[i];
          const info = g ? GRUPOS[g] : null;
          return (
            <button key={i} className="plate-col" data-on={g ? 1 : 0} data-hoje={diaSel === i ? 1 : 0}
              style={{ color: info ? info.cor : C.line }}
              onClick={() => { setDiaSel(i); setViagem(false); }}
              aria-label={g ? `${d} — ${info.nome}` : `${d} — descanso`}>
              <div className="plate" style={{ height: info ? info.alt : 26, background: info ? info.cor : C.line }}>
                {info && <span>{info.nome.slice(0, 3)}</span>}
              </div>
              <div className="plate-lbl">{d}</div>
            </button>
          );
        })}
      </div>

      {/* modo viagem */}
      <button className="banner" onClick={() => setViagem(!viagem)}
        style={{
          width: "100%", marginTop: 8, cursor: "pointer", textAlign: "left",
          background: viagem ? "rgba(199,125,255,.14)" : C.bg2,
          border: `1px solid ${viagem ? C.travel : C.line}`,
        }}>
        <Plane size={18} color={viagem ? C.travel : C.mut} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: viagem ? C.travel : C.txt }}>
            {viagem ? "Modo viagem ativo" : "Modo viagem"}
          </div>
          <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>
            {viagem ? "Corpo inteiro, com o que tiver no hotel" : "Rotina curta e genérica para hotel"}
          </div>
        </div>
        <div style={{ width: 38, height: 22, borderRadius: 99, background: viagem ? C.travel : C.line, position: "relative" }}>
          <div style={{
            position: "absolute", top: 3, left: viagem ? 19 : 3, width: 16, height: 16,
            borderRadius: 99, background: viagem ? "#1A0B26" : C.mut, transition: ".2s",
          }} />
        </div>
      </button>

      {viagem && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 11 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 7 }}>O que tem disponível</div>
            <div style={{ display: "flex", gap: 7 }}>
              {[["nenhum", "Só o corpo"], ["halteres", "Halteres"], ["completa", "Academia"]].map(([v, l]) => (
                <button key={v} className="chip" style={{ flex: 1 }} data-on={equip === v ? 1 : 0} onClick={() => setEquip(v)}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 7 }}>Tempo que você tem</div>
            <div style={{ display: "flex", gap: 7 }}>
              {[20, 30, 45].map((m) => (
                <button key={m} className="chip" style={{ flex: 1 }} data-on={minutos === m ? 1 : 0} onClick={() => setMinutos(m)}>{m} min</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* título do treino */}
      <div style={{ marginTop: 22, display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ width: 4, height: 26, borderRadius: 2, background: viagem ? C.travel : grupo ? GRUPOS[grupo].cor : C.line }} />
        <h2 className="disp" style={{ fontSize: 25 }}>
          {viagem ? "Corpo inteiro" : grupo ? GRUPOS[grupo].nome : "Descanso"}
        </h2>
        <span className="mono" style={{ fontSize: 12, color: C.mut }}>
          {exercicios.length ? `${exercicios.length} ex. · ≈${minutosEstimados}min` : ""}
        </span>
      </div>

      {!exercicios.length ? (
        <div className="card" style={{ marginTop: 12, padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Dia livre</div>
          <div style={{ fontSize: 13, color: C.mut, marginTop: 6, lineHeight: 1.5 }}>
            Descanso faz parte do treino. Se quiser treinar mesmo assim, toque numa anilha acima ou ligue o modo viagem.
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginTop: 12 }}>
            {exercicios.map((e, i) => {
              const ult = ultimos[e.nome];
              const abertoAqui = aberto === i;
              return (
                <div className="ex" key={e.nome + i}>
                  <div className="ex-top" onClick={() => setAberto(abertoAqui ? -1 : i)}>
                    <div className="ex-num mono">{String(i + 1).padStart(2, "0")}</div>
                    <div style={{ flex: 1 }}>
                      <div className="ex-nome">{e.nome}</div>
                      <div className="ex-meta">
                        {e.series} × {e.reps} · {e.desc}s descanso{e.alvo ? ` · ${e.alvo}` : ""}
                        {e.eq && e.eq !== "maquina" && (
                          <span style={{ color: C.p15 }}> · {e.eq === "halteres" ? "halteres" : e.eq === "livre" ? "barra livre" : "peso do corpo"}</span>
                        )}
                      </div>
                    </div>
                    <a className="vid-btn" aria-label={`Ver vídeo de ${e.nome} no YouTube`}
                      href={linkYoutube(e.nome)} target="_blank" rel="noopener noreferrer"
                      onClick={(ev) => ev.stopPropagation()}>
                      <Youtube size={17} />
                    </a>
                    <ChevronDown size={17} color={C.mut}
                      style={{ transform: abertoAqui ? "rotate(180deg)" : "none", transition: ".2s", flexShrink: 0 }} />
                  </div>

                  {abertoAqui && (
                    <div className="ex-body">
                      {ult && (
                        <div className="mono" style={{ fontSize: 11.5, color: C.mut, marginBottom: 11 }}>
                          Último ({fmtData(ult.data)}): {ult.melhor.kg}kg × {ult.melhor.reps}
                        </div>
                      )}
                      <div className="serie-row" style={{ marginBottom: 6 }}>
                        <div />
                        <div className="eyebrow" style={{ fontSize: 10 }}>Carga kg</div>
                        <div className="eyebrow" style={{ fontSize: 10 }}>Reps</div>
                        <div />
                      </div>
                      {Array.from({ length: e.series }).map((_, s) => {
                        const v = (log[e.nome] || [])[s] || {};
                        return (
                          <div className="serie-row" key={s}>
                            <div className="serie-n">{s + 1}</div>
                            <input className="f mono" inputMode="decimal" placeholder={ult ? String(ult.melhor.kg) : "—"}
                              value={v.kg || ""} onChange={(ev) => setSerie(e.nome, s, "kg", ev.target.value.replace(",", "."))} />
                            <input className="f mono" inputMode="numeric" placeholder={e.reps.split("-")[0]}
                              value={v.reps || ""} onChange={(ev) => setSerie(e.nome, s, "reps", ev.target.value.replace(/\D/g, ""))} />
                            <div className="chk" data-on={v.ok ? 1 : 0} onClick={() => setSerie(e.nome, s, "ok", !v.ok)}>
                              <Check size={17} color={v.ok ? "#fff" : C.mut} strokeWidth={3} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card" style={{ marginTop: 12, padding: 13 }}>
            <div className="row">
              <div style={{ display: "flex", gap: 20 }}>
                <div>
                  <div className="disp" style={{ fontSize: 21 }}>{nfmt(volume)}<span style={{ fontSize: 12, color: C.mut }}> kg</span></div>
                  <div className="stat-l">Volume de hoje</div>
                </div>
                <div>
                  <div className="disp" style={{ fontSize: 21 }}>{seriesFeitas}</div>
                  <div className="stat-l">Séries feitas</div>
                </div>
              </div>
              <Timer size={20} color={C.mut} />
            </div>
          </div>

          <button className="btn btn-p btn-full" style={{ marginTop: 12, marginBottom: 20, opacity: salvo ? 0.5 : 1 }}
            onClick={concluir} disabled={salvo}>
            {salvo ? <><Check size={16} /> Treino registrado</> : "Concluir treino"}
          </button>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   ABA PROGRESSO
--------------------------------------------------------------- */
function Progresso({ perfil, treinos, salvarTreinos }) {
  const semanas = useMemo(() => {
    const m = {};
    treinos.forEach((t) => {
      const k = inicioSemana(t.data);
      m[k] = (m[k] || 0) + t.volume;
    });
    const hojeSem = inicioSemana(hoje());
    const out = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(hojeSem + "T12:00:00");
      d.setDate(d.getDate() - i * 7);
      const k = d.toISOString().slice(0, 10);
      out.push({ sem: fmtData(k), volume: Math.round(m[k] || 0) });
    }
    return out;
  }, [treinos]);

  const semanaAtual = treinos.filter((t) => inicioSemana(t.data) === inicioSemana(hoje()));
  const volTotal = treinos.reduce((a, t) => a + t.volume, 0);

  const recordes = useMemo(() => {
    const m = {};
    treinos.forEach((t) =>
      t.exercicios.forEach((e) =>
        e.series.forEach((s) => {
          if (s.kg > 0 && (!m[e.nome] || s.kg > m[e.nome].kg)) m[e.nome] = { kg: s.kg, reps: s.reps, data: t.data };
        })
      )
    );
    return Object.entries(m).sort((a, b) => b[1].data.localeCompare(a[1].data)).slice(0, 10);
  }, [treinos]);

  if (!treinos.length)
    return (
      <div className="wrap" style={{ paddingTop: 26 }}>
        <h1 className="disp" style={{ fontSize: 27 }}>Progresso</h1>
        <div className="card" style={{ marginTop: 16, padding: 26, textAlign: "center" }}>
          <Trophy size={26} color={C.mut} />
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>Nada registrado ainda</div>
          <div style={{ fontSize: 13, color: C.mut, marginTop: 6, lineHeight: 1.5 }}>
            Registre seu primeiro treino na aba Treino e os números aparecem aqui.
          </div>
        </div>
      </div>
    );

  return (
    <div className="wrap" style={{ paddingTop: 26 }}>
      <h1 className="disp" style={{ fontSize: 27 }}>Progresso</h1>

      <div className="grid3" style={{ marginTop: 16 }}>
        <div className="card stat">
          <div className="stat-v">{semanaAtual.length}<span style={{ fontSize: 14, color: C.mut }}>/5</span></div>
          <div className="stat-l">Esta semana</div>
        </div>
        <div className="card stat">
          <div className="stat-v">{treinos.length}</div>
          <div className="stat-l">Total</div>
        </div>
        <div className="card stat">
          <div className="stat-v" style={{ fontSize: 22 }}>{nfmt(volTotal / 1000)}<span style={{ fontSize: 12, color: C.mut }}>t</span></div>
          <div className="stat-l">Volume total</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, padding: "16px 8px 8px" }}>
        <div className="eyebrow" style={{ paddingLeft: 8, marginBottom: 12 }}>Volume por semana (kg)</div>
        <ResponsiveContainer width="100%" height={165}>
          <BarChart data={semanas} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke={C.line} vertical={false} />
            <XAxis dataKey="sem" tick={{ fill: C.mut, fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.mut, fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "rgba(255,255,255,.04)" }}
              contentStyle={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, fontSize: 12, color: C.txt }} />
            <Bar dataKey="volume" fill={C.p15} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Recordes de carga</div>
      <div className="card">
        {recordes.map(([nome, r]) => (
          <div key={nome} className="ex" style={{ padding: "12px 15px", display: "flex", alignItems: "center", gap: 10 }}>
            <Flame size={15} color={C.p25} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{nome}</div>
            <div className="mono" style={{ fontSize: 13 }}>{r.kg}kg × {r.reps}</div>
          </div>
        ))}
      </div>

      <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Últimos treinos</div>
      <div className="card" style={{ marginBottom: 20 }}>
        {[...treinos].reverse().slice(0, 12).map((t) => (
          <div key={t.id} className="ex" style={{ padding: "12px 15px", display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 6, height: 26, borderRadius: 3, background: t.viagem ? C.travel : GRUPOS[t.grupo]?.cor || C.mut }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {t.viagem ? "Viagem — corpo inteiro" : GRUPOS[t.grupo]?.nome || t.grupo}
              </div>
              <div className="mono" style={{ fontSize: 11.5, color: C.mut, marginTop: 2 }}>
                {fmtData(t.data)} · {t.exercicios.length} exercícios · {nfmt(t.volume)} kg
              </div>
            </div>
            <button className="btn btn-sm" style={{ padding: 8 }} aria-label="Apagar treino"
              onClick={() => salvarTreinos(treinos.filter((x) => x.id !== t.id))}>
              <Trash2 size={14} color={C.mut} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ABA PESO
--------------------------------------------------------------- */
function Peso({ perfil, pesos, salvarPesos, salvarPerfil }) {
  const [v, setV] = useState("");
  const ordenados = useMemo(() => [...pesos].sort((a, b) => a.data.localeCompare(b.data)), [pesos]);
  const atual = ordenados.length ? ordenados[ordenados.length - 1].kg : perfil.peso;
  const primeiro = ordenados.length ? ordenados[0].kg : perfil.peso;
  const imc = atual / Math.pow(perfil.altura / 100, 2);
  const delta = atual - primeiro;

  const add = () => {
    const kg = parseFloat(v);
    if (!kg || kg < 25 || kg > 350) return;
    const novos = [...pesos.filter((p) => p.data !== hoje()), { data: hoje(), kg }];
    salvarPesos(novos);
    salvarPerfil({ ...perfil, peso: kg });
    setV("");
  };

  return (
    <div className="wrap" style={{ paddingTop: 26 }}>
      <h1 className="disp" style={{ fontSize: 27 }}>Peso corporal</h1>

      <div className="grid3" style={{ marginTop: 16 }}>
        <div className="card stat">
          <div className="stat-v">{atual.toFixed(1)}</div>
          <div className="stat-l">Atual (kg)</div>
        </div>
        <div className="card stat">
          <div className="stat-v" style={{ color: delta > 0 ? C.p15 : delta < 0 ? C.p10 : C.txt }}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}
          </div>
          <div className="stat-l">Variação</div>
        </div>
        <div className="card stat">
          <div className="stat-v">{imc.toFixed(1)}</div>
          <div className="stat-l">IMC</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, padding: 13 }}>
        <div className="eyebrow" style={{ marginBottom: 9 }}>Registrar peso de hoje</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="f mono" inputMode="decimal" placeholder={atual.toFixed(1)} value={v}
            onChange={(e) => setV(e.target.value.replace(",", "."))} />
          <button className="btn btn-p" style={{ flexShrink: 0 }} onClick={add}><Plus size={16} /> Salvar</button>
        </div>
      </div>

      {ordenados.length >= 2 && (
        <div className="card" style={{ marginTop: 12, padding: "16px 8px 8px" }}>
          <div className="eyebrow" style={{ paddingLeft: 8, marginBottom: 12 }}>Evolução</div>
          <ResponsiveContainer width="100%" height={175}>
            <LineChart data={ordenados.map((p) => ({ d: fmtData(p.data), kg: p.kg }))}
              margin={{ top: 4, right: 12, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={C.line} vertical={false} />
              <XAxis dataKey="d" tick={{ fill: C.mut, fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <YAxis domain={["dataMin - 1.5", "dataMax + 1.5"]} tick={{ fill: C.mut, fontSize: 10, fontFamily: "IBM Plex Mono" }}
                axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10, fontSize: 12, color: C.txt }} />
              <Line type="monotone" dataKey="kg" stroke={C.p20} strokeWidth={2.5} dot={{ r: 3, fill: C.p20 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {ordenados.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Histórico</div>
          <div className="card" style={{ marginBottom: 20 }}>
            {[...ordenados].reverse().map((p) => (
              <div key={p.data} className="ex" style={{ padding: "11px 15px", display: "flex", alignItems: "center", gap: 10 }}>
                <Calendar size={14} color={C.mut} />
                <div className="mono" style={{ flex: 1, fontSize: 13, color: C.mut }}>{fmtData(p.data)}</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{p.kg.toFixed(1)} kg</div>
                <button className="btn btn-sm" style={{ padding: 7 }} aria-label="Apagar registro"
                  onClick={() => salvarPesos(pesos.filter((x) => x.data !== p.data))}>
                  <Trash2 size={13} color={C.mut} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   ABA PERFIL
--------------------------------------------------------------- */
function Perfil({ perfil, salvarPerfil, salvarTreinos, salvarPesos }) {
  const [p, setP] = useState(perfil);
  const [confirmar, setConfirmar] = useState(false);
  const set = (k, v) => { const n = { ...p, [k]: v }; setP(n); salvarPerfil(n); };

  const mover = (i, dir) => {
    const o = [...p.ordem];
    const j = i + dir;
    if (j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]];
    set("ordem", o);
  };

  const toggleDia = (d) => {
    const tem = p.dias.includes(d);
    if (tem && p.dias.length > 1) set("dias", p.dias.filter((x) => x !== d));
    else if (!tem && p.dias.length < 5) set("dias", [...p.dias, d].sort((a, b) => a - b));
  };

  return (
    <div className="wrap" style={{ paddingTop: 26, paddingBottom: 20 }}>
      <h1 className="disp" style={{ fontSize: 27 }}>Perfil</h1>

      <div style={{ marginTop: 16 }}>
        <Campo label="Nome">
          <input className="f" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }} value={p.nome}
            onChange={(e) => set("nome", e.target.value)} />
        </Campo>
      </div>

      <div className="grid3" style={{ marginTop: 16 }}>
        <Campo label="Idade">
          <input className="f mono" inputMode="numeric" value={p.idade}
            onChange={(e) => set("idade", +e.target.value.replace(/\D/g, "") || 0)} />
        </Campo>
        <Campo label="Peso">
          <input className="f mono" inputMode="decimal" value={p.peso}
            onChange={(e) => set("peso", +e.target.value.replace(",", ".") || 0)} />
        </Campo>
        <Campo label="Altura">
          <input className="f mono" inputMode="numeric" value={p.altura}
            onChange={(e) => set("altura", +e.target.value.replace(/\D/g, "") || 0)} />
        </Campo>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Experiência</div>
        <div style={{ display: "flex", gap: 7 }}>
          {[["iniciante", "Iniciante"], ["intermediario", "Intermediário"], ["avancado", "Avançado"]].map(([v, l]) => (
            <button key={v} className="chip" style={{ flex: 1 }} data-on={p.nivel === v ? 1 : 0} onClick={() => set("nivel", v)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Objetivo</div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {LISTA_OBJETIVOS.map(([v, l]) => (
            <button key={v} className="chip" data-on={p.objetivo === v ? 1 : 0} onClick={() => set("objetivo", v)}>{l}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.mut, marginTop: 8, lineHeight: 1.5 }}>
          {OBJETIVOS[p.objetivo]?.resumo}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Tempo disponível para musculação</div>
        <div style={{ display: "flex", gap: 7 }}>
          {[20, 30, 45, 60].map((m) => (
            <button key={m} className="chip" style={{ flex: 1 }} data-on={(p.minutosTreino || 30) === m ? 1 : 0}
              onClick={() => set("minutosTreino", m)}>{m} min</button>
          ))}
        </div>
      </div>

      <button className="banner" onClick={() => set("prefMaquina", p.prefMaquina === false)}
        style={{
          width: "100%", marginTop: 16, cursor: "pointer", textAlign: "left",
          background: p.prefMaquina !== false ? "rgba(23,146,91,.12)" : C.bg2,
          border: `1px solid ${p.prefMaquina !== false ? C.p10 : C.line}`,
        }}>
        <Dumbbell size={18} color={p.prefMaquina !== false ? C.p10 : C.mut} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Priorizar aparelhos guiados</div>
          <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>
            Menos halteres e barra livre, mais máquina — só sai da máquina se faltar opção
          </div>
        </div>
        <div style={{ width: 38, height: 22, borderRadius: 99, background: p.prefMaquina !== false ? C.p10 : C.line, position: "relative", flexShrink: 0 }}>
          <div style={{
            position: "absolute", top: 3, left: p.prefMaquina !== false ? 19 : 3, width: 16, height: 16,
            borderRadius: 99, background: p.prefMaquina !== false ? "#0B3D26" : C.mut, transition: ".2s",
          }} />
        </div>
      </button>

      <div style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Dias de treino</div>
        <div style={{ display: "flex", gap: 6 }}>
          {DIAS.map((d, i) => (
            <button key={i} className="chip" style={{ flex: 1, padding: "9px 0" }}
              data-on={p.dias.includes(i) ? 1 : 0} onClick={() => toggleDia(i)}>{d}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Ordem dos grupos musculares</div>
        <div className="card">
          {p.ordem.map((g, i) => (
            <div key={g} className="ex" style={{ padding: "11px 13px", display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 6, height: 24, borderRadius: 3, background: GRUPOS[g].cor }} />
              <div className="mono" style={{ fontSize: 11, color: C.mut, width: 30 }}>{DIAS[p.dias[i]] || "—"}</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{GRUPOS[g].nome}</div>
              <button className="btn btn-sm" style={{ padding: "5px 9px" }} onClick={() => mover(i, -1)} aria-label="Subir">↑</button>
              <button className="btn btn-sm" style={{ padding: "5px 9px" }} onClick={() => mover(i, 1)} aria-label="Descer">↓</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18, padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Renovar exercícios</div>
        <div style={{ fontSize: 13, color: C.mut, marginTop: 5, lineHeight: 1.5 }}>
          A rotina troca sozinha a cada 4 semanas. Toque abaixo para trocar antes disso.
        </div>
        <button className="btn btn-full" style={{ marginTop: 11 }}
          onClick={() => salvarPerfil({ ...p, ciclosExtras: (p.ciclosExtras || 0) + 1 })}>
          <RefreshCw size={15} /> Avançar para o próximo ciclo
        </button>
      </div>

      <div className="card" style={{ marginTop: 12, padding: 14, borderColor: confirmar ? C.p25 : C.line }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Apagar todos os dados</div>
        <div style={{ fontSize: 13, color: C.mut, marginTop: 5, lineHeight: 1.5 }}>
          {confirmar ? "Isso apaga perfil, treinos e pesos. Não dá para desfazer." : "Recomeça do zero, incluindo histórico."}
        </div>
        {confirmar ? (
          <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
            <button className="btn" style={{ flex: 1 }} onClick={() => setConfirmar(false)}>Cancelar</button>
            <button className="btn" style={{ flex: 1, background: C.p25, borderColor: C.p25, color: "#fff" }}
              onClick={async () => {
                salvarTreinos([]); salvarPesos([]); salvarPerfil(null);
                await store.delete("gym:perfil");
              }}>
              Apagar tudo
            </button>
          </div>
        ) : (
          <button className="btn btn-full" style={{ marginTop: 11 }} onClick={() => setConfirmar(true)}>
            <Trash2 size={15} /> Apagar dados
          </button>
        )}
      </div>
    </div>
  );
}
