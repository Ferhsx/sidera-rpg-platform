import { Archetype, Pillar, Weapon } from "@/types/index";


export const WEAPON_CATALOG: Omit<Weapon, 'id' | 'status'>[] = [
  {
    catalogId: 'faca', name: 'Adaga / Faca', damage: 2, category: 'Light', range: 'Imediato', cost: 20, weight: 0,
    properties: ['Ocultável', 'Arremessável'], description: 'Crítico: +5 de Dano (Vital).'
  },
  {
    catalogId: 'machadinha', name: 'Machadinha', damage: 2, category: 'Medium', range: 'Imediato', cost: 30, weight: 1,
    properties: ['Brutal'], description: 'Quebra portas e escudos.'
  },
  {
    catalogId: 'espada', name: 'Espada Curta', damage: 3, category: 'Medium', range: 'Imediato', cost: 50, weight: 1,
    properties: ['Padrão'], description: 'Crítico: Acerta ponto vital (+2 PV de dano).'
  },
  {
    catalogId: 'lanca', name: 'Lança', damage: 3, category: 'Medium', range: 'Alcance', cost: 40, weight: 1,
    properties: ['Alcance', 'Duas Mãos'], description: 'Mantém inimigos a distância.'
  },
  {
    catalogId: 'montante', name: 'Montante', damage: 4, category: 'Heavy', range: 'Imediato', cost: 120, weight: 2,
    properties: ['Pesada', 'Duas Mãos'], description: 'Lento. Crítico: Desmaia o inimigo.'
  },
  {
    catalogId: 'arco', name: 'Arco Curto', damage: 2, category: 'Ranged', range: 'Médio', cost: 40, weight: 1,
    properties: ['Silencioso', 'Duas Mãos'], description: 'Crítico: Causa 6 de dano.'
  },
  {
    catalogId: 'pistola', name: 'Pistola', damage: 5, category: 'Firearm', range: 'Curto', cost: 200, weight: 1,
    properties: ['Perfurante', 'Barulhenta'], maxAmmo: 1, currentAmmo: 1, description: 'Recarga: 1 Ação. Crítico: Mata na hora.'
  },
  {
    catalogId: 'municao_pistola', name: 'Pente de Munição (6)', damage: 0, category: 'Firearm', range: '-', cost: 15, weight: 0,
    properties: ['Consumível'], description: 'Necessário para recarregar a pistola.'
  },
  {
    catalogId: 'escudo_madeira', name: 'Escudo de Madeira', damage: 1, category: 'Shield', range: 'Imediato', cost: 30, weight: 1,
    properties: ['+1 RD (Passivo)'], description: 'Pode ignorar 1 ataque (fica Derrubado).'
  },
  {
    catalogId: 'escudo_ferro', name: 'Escudo de Ferro', damage: 1, category: 'Shield', range: 'Imediato', cost: 80, weight: 2,
    properties: ['+1 RD (Passivo)', 'Pesado'], description: 'Indestrutível por armas comuns.'
  }
];

export const ARCHETYPES: Archetype[] = [
  {
    id: 'sol',
    name: 'O Soberano',
    planet: 'Sol',
    type: 'Médio',
    bonusHp: 2,
    primaryAttribute: 'sal',
    description: "Imune a fogo e calor. Brilho nos olhos. Sua palavra queima como lei.",
    passive: "Aura da Verdade: Luz que força submissão ou verdade.",
    manifestation: "Gaste +1 Órbita para iluminar mentiras e enfraquecer inimigos.",
    flaw: "Você não pode recuar ou se esconder. Você se acha divino."
  },
  {
    id: 'lua',
    name: 'O Fantasma',
    planet: 'Lua',
    type: 'Leve',
    bonusHp: 0,
    primaryAttribute: 'mercurio',
    description: "Passo silencioso, queda lenta. Um espião nascido nas sombras.",
    passive: "Mimetismo: Fica invisível por rodadas iguais à Órbita.",
    manifestation: "Gaste +1 Órbita para desaparecer.",
    flaw: "Perde a fala. Só se comunica por sussurros mentais."
  },
  {
    id: 'marte',
    name: 'O Carniceiro',
    planet: 'Marte',
    type: 'Médio',
    bonusHp: 2,
    primaryAttribute: 'ferro',
    description: "Viciado em adrenalina e violência. Nascido para a guerra.",
    passive: "Vantagem na Iniciativa.",
    manifestation: "Fúria Cinética: +1 Dano a cada 2 pontos de Órbita.",
    flaw: "Não distingue amigos de inimigos próximos (1m)."
  },
  {
    id: 'terra',
    name: 'A Fortaleza',
    planet: 'Terra',
    type: 'Pesado',
    bonusHp: 4,
    primaryAttribute: 'ferro',
    description: "Tanque imenso. Sua pele é dura como rocha.",
    passive: "+1 Redução de Dano natural.",
    manifestation: "Terremoto: Cria ondas de choque e derruba inimigos.",
    flaw: "Velocidade reduzida pela metade. Você está virando pedra."
  },
  {
    id: 'mercurio',
    name: 'O Nervo',
    planet: 'Mercúrio',
    type: 'Leve',
    bonusHp: 0,
    primaryAttribute: 'mercurio',
    description: "Processamento mental instantâneo. O mundo parece lento.",
    passive: "Overclock: Aceleração temporal.",
    manifestation: "Gaste +1 Órbita para ganhar Ações de Movimento ou Principais extras.",
    flaw: "Mãos trêmulas. Incapaz de segurar objetos delicados."
  },
  {
    id: 'jupiter',
    name: 'O Titã',
    planet: 'Júpiter',
    type: 'Pesado',
    bonusHp: 4,
    primaryAttribute: 'ferro',
    description: "Conta como tamanho Grande. Uma força da gravidade viva.",
    passive: "Imune a empurrões.",
    manifestation: "Pressão Atmosférica: Esmaga inimigos à distância.",
    flaw: "Gravidade intensa atrapalha aliados adjacentes (-1)."
  },
  {
    id: 'venus',
    name: 'O Jardim',
    planet: 'Vênus',
    type: 'Leve',
    bonusHp: 0,
    primaryAttribute: 'sal',
    description: "Beleza tóxica. Imunidade a venenos.",
    passive: "Esporos da Paixão/Dor.",
    manifestation: "Gaste +1 Órbita para incapacitar alvos com prazer ou dor.",
    flaw: "Seu cheiro atrai todos os monstros num raio de 1km."
  },
  {
    id: 'saturno',
    name: 'O Juiz',
    planet: 'Saturno',
    type: 'Médio',
    bonusHp: 2,
    primaryAttribute: 'enxofre',
    description: "Percebe a morte e fraquezas estruturais.",
    passive: "Toque de Entropia: Envelhece e destrói matéria.",
    manifestation: "Gaste +1 Órbita para desintegrar objetos de tamanho crescente.",
    flaw: "Drena calor. Fogueiras apagam e água congela ao seu toque."
  },
  {
    id: 'netuno',
    name: 'O Mártir',
    planet: 'Netuno',
    type: 'Médio',
    bonusHp: 2,
    primaryAttribute: 'enxofre',
    description: "Complexo de salvador. Sente a dor dos outros. Sangue coagula instantaneamente.",
    passive: "Hidrostática: Nunca se afoga, imune a sangramento.",
    manifestation: "Transfusão Abissal: Cura outros sacrificando sua própria sanidade (+2 Órbita).",
    flaw: "Começa a suar água salgada. Mãos escorregadias."
  }
];

export const PILLARS: Pillar[] = [
  {
    title: "O Céu é uma Ameaça",
    description: "Os planetas são entidades sencientes e tirânicas. Você não nasceu sob um signo para ter sorte; você foi marcado como propriedade.",
    icon: 'star'
  },
  {
    title: "A Sobrevivência é Cara",
    description: "Não existe cura mágica. Comida é escassa. Aço é valioso. Um par de botas novas é tão gratificante quanto uma espada lendária.",
    icon: 'skull'
  },
  {
    title: "Poder Cobra um Preço",
    description: "Você pode invocar seu Astro para realizar milagres, mas cada uso aumenta sua Órbita. Quanto mais alto você sobe, menos humano você permanece.",
    icon: 'scale'
  }
];