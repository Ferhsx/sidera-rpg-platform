export interface AstralPowerTier {
    range: string;    // 'Órbita 1-4', 'Órbita 5-8', 'Órbita 9-10'
    effect: string;
}

export interface AstralPower {
    id: string;
    archetypeId: string;
    name: string;
    category: string;     // 'Social/Revelação', 'Dano Direto', etc.
    cost: string;         // '+1 Órbita' or '+2 Órbita'
    description: string;
    tiers: {
        low: AstralPowerTier;   // Órbita 1-4
        mid: AstralPowerTier;   // Órbita 5-8
        high: AstralPowerTier;  // Órbita 9-10
    };
}

export const ASTRAL_POWERS: AstralPower[] = [
    // ========== I. SOL (O Soberano) ==========
    {
        id: 'aura_da_verdade',
        archetypeId: 'sol',
        name: 'Aura da Verdade',
        category: 'Social / Revelação',
        cost: '+1 Órbita',
        description: 'Você emite uma luz dourada e opressora. Mentiras queimam a língua de quem as profere.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'A luz ilumina 10m. Vantagem em testes de Sal (Intimidação) e percebe mentiras diretas.' },
            mid: { range: 'Órbita 5-8', effect: 'A luz cega. Inimigos olhando para você têm Desvantagem em ataques. Ilusões dissipadas em 10m.' },
            high: { range: 'Órbita 9-10', effect: '"O Sol da Meia-Noite". Todos num raio de 20m testam Sal ou se rendem. Aberrações sofrem 1d6/turno.' }
        }
    },
    {
        id: 'olhar_febril',
        archetypeId: 'sol',
        name: 'Olhar Febril',
        category: 'Dano Direto',
        cost: '+1 Órbita',
        description: 'Você dispara um feixe de calor concentrado pelos olhos ou boca.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '1d6 Dano de Fogo em um alvo a 10m. Ignora 1 RD de armaduras normais.' },
            mid: { range: 'Órbita 5-8', effect: 'Feixe se bifurca num cone de 3m. 1d6+2 Dano de Fogo, pega fogo em roupas/cabelos.' },
            high: { range: 'Órbita 9-10', effect: '"Erupção Solar". Linha de 30m: 10 Dano direto, derrete até rocha. Perde visão por 1 hora.' }
        }
    },
    {
        id: 'coroa_de_chamas',
        archetypeId: 'sol',
        name: 'Coroa de Chamas',
        category: 'Defesa',
        cost: '+1 Órbita',
        description: 'Seu corpo literalmente entra em combustão, mas você não sente dor.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Ataque corpo-a-corpo contra você causa 1 Dano de fogo de volta ao atacante.' },
            mid: { range: 'Órbita 5-8', effect: '+2 RD contra frio e físico. Atacantes sofrem 1d4 de Dano.' },
            high: { range: 'Órbita 9-10', effect: 'Pira humana. Tudo a 3m toma 1d6 automático/turno. Armas de madeira queimam.' }
        }
    },
    {
        id: 'veredito_real',
        archetypeId: 'sol',
        name: 'Veredito Real',
        category: 'Suporte / Buff',
        cost: '+1 Órbita',
        description: 'Sua voz ecoa como um trovão divino, inspirando ou ordenando.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Vantagem no próximo teste de Sal ou Ferro para um aliado que possa te ouvir.' },
            mid: { range: 'Órbita 5-8', effect: 'Comanda um inimigo fraco a "PARAR". Perde a próxima ação se falhar em Sal.' },
            high: { range: 'Órbita 9-10', effect: '"De Joelhos!" Todos os inimigos num raio de 10m ficam Derrubados automaticamente.' }
        }
    },

    // ========== II. LUA (O Fantasma) ==========
    {
        id: 'mimetismo_sombra',
        archetypeId: 'lua',
        name: 'Mimetismo de Sombra',
        category: 'Stealth / Defesa',
        cost: '+1 Órbita',
        description: 'Você dobra a luz ao seu redor, tornando-se translúcido ou invisível.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Invisível. Se atacar ou tomar dano, a invisibilidade quebra.' },
            mid: { range: 'Órbita 5-8', effect: 'Invisibilidade persiste após ataque (1d4 turnos). Desvantagem para ser acertado.' },
            high: { range: 'Órbita 9-10', effect: 'Não existe mais neste plano por 1 turno. Imune a tudo, não pode interagir.' }
        }
    },
    {
        id: 'espelho_loucura',
        archetypeId: 'lua',
        name: 'Espelho da Loucura',
        category: 'Controle Mental',
        cost: '+1 Órbita',
        description: 'Você projeta alucinações na mente de um alvo.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Cria som ou imagem falsa que distrai guarda/inimigo (perde turno de movimento).' },
            mid: { range: 'Órbita 5-8', effect: 'O alvo vê seu maior medo. Foge por 1d4 turnos ou ataca aliado mais próximo em pânico.' },
            high: { range: 'Órbita 9-10', effect: '"Pesadelo Coletivo". Inimigos na sala testam Enxofre ou caem gritando por 1 turno.' }
        }
    },
    {
        id: 'passo_lunar',
        archetypeId: 'lua',
        name: 'Passo Lunar',
        category: 'Mobilidade',
        cost: '+1 Órbita',
        description: 'Você altera a gravidade pessoal para flutuar ou andar em paredes.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Salto triplo e queda de qualquer altura sem dano.' },
            mid: { range: 'Órbita 5-8', effect: 'Andar em paredes e tetos como chão normal por 1 minuto.' },
            high: { range: 'Órbita 9-10', effect: 'Voo real. Levita livremente por 1 cena. Se a órbita cair, despenca.' }
        }
    },
    {
        id: 'lamina_prata',
        archetypeId: 'lua',
        name: 'Lâmina de Prata',
        category: 'Dano / Combate',
        cost: '+1 Órbita',
        description: 'Sua arma ou mãos brilham com luz prateada fria.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Arma conta como "Prata" e "Mágica" (fere fantasmas/licantropos). +1 Dano.' },
            mid: { range: 'Órbita 5-8', effect: 'Toque causa "Frio". Inimigo tem -2 em movimentos no próximo turno.' },
            high: { range: 'Órbita 9-10', effect: 'O golpe atravessa matéria. Ignora qualquer Armadura ou RD do alvo.' }
        }
    },

    // ========== III. MARTE (O Carniceiro) ==========
    {
        id: 'furia_cinetica',
        archetypeId: 'marte',
        name: 'Fúria Cinética',
        category: 'Dano Explosivo',
        cost: '+1 Órbita',
        description: 'Você canaliza raiva pura em um golpe devastador.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '+1d6 ao dano do próximo ataque corpo-a-corpo.' },
            mid: { range: 'Órbita 5-8', effect: 'Ataque atinge todos os inimigos adjacentes (Dano da arma em área).' },
            high: { range: 'Órbita 9-10', effect: '"Massacre". 3 ataques completos contra alvos diferentes. Depois, arma quebra.' }
        }
    },
    {
        id: 'adrenalina_ferro',
        archetypeId: 'marte',
        name: 'Adrenalina de Ferro',
        category: 'Sobrevivência',
        cost: '+1 Órbita',
        description: 'Você ignora a dor e a morte temporariamente.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '1d6 PV Temporários (somem ao fim da cena).' },
            mid: { range: 'Órbita 5-8', effect: 'Ignora "Moribundo" ou "Inconsciente" por 1d4 turnos. Luta com 0 PV.' },
            high: { range: 'Órbita 9-10', effect: 'Imortal por 1 turno. PV não desce abaixo de 1. No turno seguinte, cai exausto.' }
        }
    },
    {
        id: 'arsenal_sangue',
        archetypeId: 'marte',
        name: 'Arsenal de Sangue',
        category: 'Criação de Itens',
        cost: '+1 Órbita',
        description: 'Você arranca metal próximo ou do próprio sangue e molda uma arma.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Cria Adaga ou Lança improvisada instantaneamente.' },
            mid: { range: 'Órbita 5-8', effect: 'Arma vibra: +2 Dano, conta como "Pesada" mesmo sendo leve.' },
            high: { range: 'Órbita 9-10', effect: 'Magnetiza armas inimigas. Todos em 10m testam Ferro ou perdem armas.' }
        }
    },
    {
        id: 'grito_guerra',
        archetypeId: 'marte',
        name: 'Grito de Guerra',
        category: 'Debuff / Controle',
        cost: '+1 Órbita',
        description: 'Um rugido que paralisa presas.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Um inimigo fica "Abalado" (Desvantagem no próximo ataque).' },
            mid: { range: 'Órbita 5-8', effect: 'Inimigos em cone de 5m fogem ou atacam com Desvantagem por 1 turno.' },
            high: { range: 'Órbita 9-10', effect: 'Som estoura tímpanos. Inimigos em 10m ficam Surdos e Atordoados.' }
        }
    },

    // ========== IV. TERRA (A Fortaleza) ==========
    {
        id: 'pele_basalto',
        archetypeId: 'terra',
        name: 'Pele de Basalto',
        category: 'Defesa Absoluta',
        cost: '+1 Órbita',
        description: 'Sua pele racha e endurece como pedra.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '+2 RD passiva por 1 minuto. Velocidade cai pela metade.' },
            mid: { range: 'Órbita 5-8', effect: '+4 RD. Não pode correr. Flechas ricocheteiam sem dano.' },
            high: { range: 'Órbita 9-10', effect: '"A Estátua". Imune a dano físico por 1 turno, mas não pode se mover ou atacar.' }
        }
    },
    {
        id: 'terremoto',
        archetypeId: 'terra',
        name: 'Ancorar / Terremoto',
        category: 'Controle de Área',
        cost: '+1 Órbita',
        description: 'Você manipula o chão sob seus pés.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Terreno difícil num raio de 3m. Ninguém pode correr perto de você.' },
            mid: { range: 'Órbita 5-8', effect: 'Derruba todos os inimigos em 5m (Teste de Mercúrio para evitar).' },
            high: { range: 'Órbita 9-10', effect: 'Abre fenda no chão. Alvo testa Mercúrio ou cai em buraco que se fecha.' }
        }
    },
    {
        id: 'muralha_viva',
        archetypeId: 'terra',
        name: 'Muralha Viva',
        category: 'Criação / Barreira',
        cost: '+1 Órbita',
        description: 'Você ergue rocha ou terra para criar cobertura.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Ergue mureta de pedra (cobertura média) que dura 1 cena.' },
            mid: { range: 'Órbita 5-8', effect: 'Prende inimigo em algemas de pedra. "Imobilizado" até quebrar (Força).' },
            high: { range: 'Órbita 9-10', effect: 'Domo de pedra impenetrável ao redor do grupo. Nada entra ou sai até desmaiar.' }
        }
    },
    {
        id: 'sopro_poeira',
        archetypeId: 'terra',
        name: 'Sopro de Poeira',
        category: 'Debuff / Cegueira',
        cost: '+1 Órbita',
        description: 'Você expele uma nuvem de areia e detritos.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Cortina de fumaça de 3m. Visão bloqueada.' },
            mid: { range: 'Órbita 5-8', effect: 'Poeira nos pulmões. 1d4 dano e tosse violenta (Desvantagem em tudo).' },
            high: { range: 'Órbita 9-10', effect: 'Tempestade de areia. 1d6/turno em área grande. Ninguém enxerga nada.' }
        }
    },

    // ========== V. MERCÚRIO (O Nervo) ==========
    {
        id: 'overclock',
        archetypeId: 'mercurio',
        name: 'Overclock',
        category: 'Ação Extra / Tempo',
        cost: '+1 Órbita',
        description: 'Seu sistema nervoso acelera tanto que o mundo parece parar.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '1 Movimento extra gratuito no turno.' },
            mid: { range: 'Órbita 5-8', effect: '1 Ação Principal extra (ataca duas vezes), mas sofre 1 de dano.' },
            high: { range: 'Órbita 9-10', effect: 'Turno inteiro extra antes de qualquer pessoa. Depois, vomita sangue (3 dano).' }
        }
    },
    {
        id: 'salto_frequencia',
        archetypeId: 'mercurio',
        name: 'Salto de Frequência',
        category: 'Teleporte',
        cost: '+1 Órbita',
        description: 'Você se move tão rápido que parece teletransporte.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Teleporta 5 metros para um lugar visível.' },
            mid: { range: 'Órbita 5-8', effect: 'Teleporta 15 metros. Pode levar objeto pequeno ou pessoa voluntária.' },
            high: { range: 'Órbita 9-10', effect: 'Vibra através de parede sólida ou porta trancada (até 1m de espessura).' }
        }
    },
    {
        id: 'maos_vento',
        archetypeId: 'mercurio',
        name: 'Mãos de Vento',
        category: 'Utilidade / Roubo',
        cost: '+1 Órbita',
        description: 'Telecinese rápida ou roubo à distância.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Puxa item pequeno (chave, adaga) para sua mão a 5m.' },
            mid: { range: 'Órbita 5-8', effect: 'Desarma inimigo (Ferro dele vs seu Mercúrio). Arma voa para sua mão.' },
            high: { range: 'Órbita 9-10', effect: 'Vórtex que puxa todos os projéteis disparados numa rodada para o chão.' }
        }
    },
    {
        id: 'sinapse_fulminante',
        archetypeId: 'mercurio',
        name: 'Sinapse Fulminante',
        category: 'Reação / Defesa',
        cost: '+1 Órbita',
        description: 'Você reage a um ataque antes dele acontecer.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '"Esquiva" como reação (Rola Mercúrio para evitar dano total).' },
            mid: { range: 'Órbita 5-8', effect: 'Agarra flecha ou mão no ar. Contra-ataque imediato: 1d4 dano.' },
            high: { range: 'Órbita 9-10', effect: 'Corre pelas paredes e reaparece atrás do inimigo. Ataque erra + Vantagem.' }
        }
    },

    // ========== VI. JÚPITER (O Titã) ==========
    {
        id: 'pressao_atmosferica',
        archetypeId: 'jupiter',
        name: 'Pressão Atmosférica',
        category: 'Dano Gravitacional',
        cost: '+1 Órbita',
        description: 'Você aumenta a gravidade em um ponto, esmagando ossos.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Alvo sofre Dano = metade da Órbita (arredondado para cima). Ignora armadura.' },
            mid: { range: 'Órbita 5-8', effect: 'Derruba e prende no chão inimigos em 3m. Teste de Força difícil para levantar.' },
            high: { range: 'Órbita 9-10', effect: '"Buraco Negro". 2d6 em área, destrói estruturas de madeira.' }
        }
    },
    {
        id: 'tita_tempestade',
        archetypeId: 'jupiter',
        name: 'Titã da Tempestade',
        category: 'Buff / Tamanho',
        cost: '+1 Órbita',
        description: 'Seus músculos incham e você parece ter 3 metros de altura.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Vantagem em testes de Ferro (Força) e +1 Dano corpo a corpo.' },
            mid: { range: 'Órbita 5-8', effect: 'Tamanho "Grande". Segura portas contra exércitos. +2 Dano corpo a corpo.' },
            high: { range: 'Órbita 9-10', effect: 'Cresce de verdade. Ataques jogam inimigos a 10m. +4 PV temporários.' }
        }
    },
    {
        id: 'voz_trovao',
        archetypeId: 'jupiter',
        name: 'Voz do Trovão',
        category: 'Controle Sônico',
        cost: '+1 Órbita',
        description: 'Você canaliza uma tempestade elétrica ou sônica.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '1d6 Dano em alvo de metal (armadura ou arma).' },
            mid: { range: 'Órbita 5-8', effect: 'Onda de choque cônica. Empurra 5m e 1d4 dano.' },
            high: { range: 'Órbita 9-10', effect: 'Raio do céu ou descarga estática. 3d6 Dano. Alvo explode se morrer.' }
        }
    },
    {
        id: 'campo_gravitacional',
        archetypeId: 'jupiter',
        name: 'Campo Gravitacional',
        category: 'Defesa / Escudo',
        cost: '+1 Órbita',
        description: 'Objetos flutuam ao seu redor, interceptando ataques.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '+1 Defesa contra ataques à distância (flechas desviam).' },
            mid: { range: 'Órbita 5-8', effect: 'Redireciona ataque à distância que errar para inimigo próximo.' },
            high: { range: 'Órbita 9-10', effect: 'Bolha de força repele qualquer criatura a 1m de você.' }
        }
    },

    // ========== VII. VÊNUS (O Jardim) ==========
    {
        id: 'esporos_paixao',
        archetypeId: 'venus',
        name: 'Esporos da Paixão/Dor',
        category: 'Debuff Químico',
        cost: '+1 Órbita',
        description: 'Você exala um gás colorido e doce.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '1 Alvo fica enjoado. Desvantagem em ataques.' },
            mid: { range: 'Órbita 5-8', effect: 'Nuvem de 3m. Inimigos "Incapacitados" (alucinando) por 1 turno.' },
            high: { range: 'Órbita 9-10', effect: 'Gás se torna ácido. 1d6/turno, derrete armaduras (perdem 1 RD permanentemente).' }
        }
    },
    {
        id: 'toque_medusa',
        archetypeId: 'venus',
        name: 'Toque da Medusa',
        category: 'Paralisia / Social',
        cost: '+1 Órbita',
        description: 'Seu toque ou olhar induz uma paralisia eufórica.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Vantagem absoluta em Persuasão/Sedução contra humanoide.' },
            mid: { range: 'Órbita 5-8', effect: 'Toque paralisante. Teste de Ferro ou paralisia por 1d4 rodadas.' },
            high: { range: 'Órbita 9-10', effect: '"Amor Eterno". Alvo se torna escravo leal por 1 hora. Luta até morrer por você.' }
        }
    },
    {
        id: 'jardim_espinhos',
        archetypeId: 'venus',
        name: 'Jardim de Espinhos',
        category: 'Controle de Área',
        cost: '+1 Órbita',
        description: 'Vinhas e espinhos rasgam sua pele ou brotam do chão.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Chicote de vinha. Ataque a 5m com 1d4 dano.' },
            mid: { range: 'Órbita 5-8', effect: 'Chão em 5m vira terreno difícil de espinhos. 1 dano por metro.' },
            high: { range: 'Órbita 9-10', effect: 'Plantas crescem dentro de inimigo ferido. 2d6 dano e imobilizado.' }
        }
    },
    {
        id: 'regeneracao_parasitaria',
        archetypeId: 'venus',
        name: 'Regeneração Parasitária',
        category: 'Cura / Roubo de Vida',
        cost: '+1 Órbita',
        description: 'Você rouba vitalidade de plantas ou pessoas.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Murcha plantas para curar 2 PV em si mesmo.' },
            mid: { range: 'Órbita 5-8', effect: 'Toque Vampírico. 1d4 dano no inimigo, cura mesma quantia em você.' },
            high: { range: 'Órbita 9-10', effect: 'Nuvem de esporos curativos. Todos aliados recuperam 1d6 PV. Cicatriz em flor.' }
        }
    },

    // ========== VIII. SATURNO (O Juiz) ==========
    {
        id: 'toque_entropia',
        archetypeId: 'saturno',
        name: 'Toque de Entropia',
        category: 'Destruição de Matéria',
        cost: '+1 Órbita',
        description: 'Você envelhece objetos até virarem pó.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Destrói objetos pequenos não mágicos (cordas, fechaduras, dobradiças).' },
            mid: { range: 'Órbita 5-8', effect: 'Enferruja arma/armadura inimiga. Arma quebra (-1 dano) ou armadura perde 1 RD.' },
            high: { range: 'Órbita 9-10', effect: 'Transforma parede de pedra ou porta de ferro em areia. Abre passagem.' }
        }
    },
    {
        id: 'cronostase',
        archetypeId: 'saturno',
        name: 'Cronóstase',
        category: 'Controle de Tempo',
        cost: '+1 Órbita',
        description: 'Você rouba segundos do relógio.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Inimigo alvo age por último na próxima rodada.' },
            mid: { range: 'Órbita 5-8', effect: '"Slow Motion". Alvo tem apenas 1 ação (Movimento ou Ataque) por 2 turnos.' },
            high: { range: 'Órbita 9-10', effect: 'Parar o Tempo. 10 segundos. Pode agir livremente, mas se atacar, o tempo volta.' }
        }
    },
    {
        id: 'sopro_vazio',
        archetypeId: 'saturno',
        name: 'Sopro do Vazio',
        category: 'Dano / Frio',
        cost: '+1 Órbita',
        description: 'A temperatura cai para o zero absoluto ao seu redor.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Apaga luzes não-mágicas na sala. Inimigos tremem (-1 em ataques).' },
            mid: { range: 'Órbita 5-8', effect: 'Cone de Frio. 2d6 Dano de Gelo. Se matar, alvo vira estátua de gelo.' },
            high: { range: 'Órbita 9-10', effect: '"Morte Térmica". Líquidos em 10m congelam (incluindo poções). 1d6 dano direto ignora armadura.' }
        }
    },
    {
        id: 'ceifador',
        archetypeId: 'saturno',
        name: 'O Ceifador',
        category: 'Dano / Execução',
        cost: '+1 Órbita',
        description: 'Você visualiza a morte do oponente e a torna real.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Sabe exatamente quantos PV o inimigo tem.' },
            mid: { range: 'Órbita 5-8', effect: 'Se atacar inimigo que já agiu no turno, +1d6 Dano necrótico.' },
            high: { range: 'Órbita 9-10', effect: '"Sentença". Aponte para inimigo com ≤5 PV. Ele morre instantaneamente.' }
        }
    },

    // ========== IX. NETUNO (O Mártir) ==========
    {
        id: 'transfusao_abissal',
        archetypeId: 'netuno',
        name: 'Transfusão Abissal',
        category: 'Cura / Sacrifício',
        cost: '+2 Órbita',
        description: 'Você toca um aliado ferido. A água do seu corpo purifica a ferida.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Cura 4 PV em alvo tocado imediatamente.' },
            mid: { range: 'Órbita 5-8', effect: 'Divide a cura: 4 PV em um alvo ou 2 PV em dois alvos.' },
            high: { range: 'Órbita 9-10', effect: '"O Milagre Final". Cura todos em 4 PV. Sua Órbita vai para 10 instantaneamente.' }
        }
    },
    {
        id: 'afogamento_seco',
        archetypeId: 'netuno',
        name: 'Afogamento Seco',
        category: 'Controle / Debuff',
        cost: '+1 Órbita',
        description: 'Você faz os pulmões de um inimigo se encherem de água salgada.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Alvo engasga. Não pode falar, conjurar ou gritar por 1 turno.' },
            mid: { range: 'Órbita 5-8', effect: '"Sufocado". Desvantagem em ações físicas e perde 1 Movimento.' },
            high: { range: 'Órbita 9-10', effect: '1d6 dano direto (ignora armadura). Cai inconsciente se falhar em Ferro.' }
        }
    },
    {
        id: 'corpo_liquefeito',
        archetypeId: 'netuno',
        name: 'Corpo Liquefeito',
        category: 'Defesa / Esquiva',
        cost: '+1 Órbita',
        description: 'Seu corpo perde coesão sólida, transformando-se em fluido viscoso.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: 'Escapa automaticamente de agarramentos, cordas ou correntes.' },
            mid: { range: 'Órbita 5-8', effect: 'Resistência a Dano Físico por 1 rodada (dano corte/impacto pela metade).' },
            high: { range: 'Órbita 9-10', effect: 'Passa por frestas de portas ou ralos. Imune a dano durante o movimento.' }
        }
    },
    {
        id: 'pressao_esmagadora',
        archetypeId: 'netuno',
        name: 'Pressão Esmagadora',
        category: 'Dano / Área',
        cost: '+1 Órbita',
        description: 'Você simula a pressão do fundo do oceano, esmagando armaduras e ossos.',
        tiers: {
            low: { range: 'Órbita 1-4', effect: '1d6 Contusão. Armadura pesada: +2 dano extra (metal amassa).' },
            mid: { range: 'Órbita 5-8', effect: 'Zona de Alta Pressão (3m). Metade do deslocamento. Projéteis caem no chão.' },
            high: { range: 'Órbita 9-10', effect: '"Implosão". Teste de Ferro ou 2d6 dano interno e atordoamento.' }
        }
    }
];
