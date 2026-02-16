export type BackgroundClass = 'parias' | 'militares' | 'trabalhadores' | 'eruditos' | 'estranhos';

export interface BackgroundStartingItem {
    name: string;
    description: string;
    weight: number;
    isWeapon?: boolean;
}

export interface Background {
    id: string;
    name: string;
    class: BackgroundClass;
    className: string;
    description: string;
    skills: string[];
    startingItem: BackgroundStartingItem;
    specialRule?: string;
    penalty?: string;
}

export const BACKGROUND_CLASSES: { id: BackgroundClass; name: string; subtitle: string }[] = [
    { id: 'parias', name: 'Os Párias', subtitle: 'A Escória do Submundo' },
    { id: 'militares', name: 'Aço e Sangue', subtitle: 'Militares e Combatentes' },
    { id: 'trabalhadores', name: 'Suor e Terra', subtitle: 'Trabalhadores e Rurais' },
    { id: 'eruditos', name: 'Pena e Incenso', subtitle: 'Eruditos e Religiosos' },
    { id: 'estranhos', name: 'Os Estranhos', subtitle: 'Antecedentes Raros' }
];

export const BACKGROUNDS: Background[] = [
    // ========== CLASSE 1: OS PÁRIAS E O SUBMUNDO ==========
    {
        id: 'rato_de_esgoto',
        name: 'Rato de Esgoto',
        class: 'parias',
        className: 'Os Párias e o Submundo',
        description: 'Você limpava as galerias subterrâneas de pragas e coisas piores.',
        skills: ['Navegar no escuro', 'Identificar venenos', 'Espremer-se em lugares apertados', 'Resistir a doenças'],
        startingItem: { name: 'Furão Treinado', description: 'Um furão treinado para farejar e caçar pragas.', weight: 0 }
    },
    {
        id: 'ladrao_de_tumulos',
        name: 'Ladrão de Túmulos',
        class: 'parias',
        className: 'Os Párias e o Submundo',
        description: 'O respeito pelos mortos não enche a barriga.',
        skills: ['Anatomia básica', 'Avaliar joias', 'Não ter medo de cadáveres', 'Cavar rápido'],
        startingItem: { name: 'Pá Afiada', description: 'Uma pá de cabo curto afiada (conta como Adaga).', weight: 1, isWeapon: true }
    },
    {
        id: 'falsificador',
        name: 'Falsificador de Documentos',
        class: 'parias',
        className: 'Os Párias e o Submundo',
        description: 'A burocracia é uma mentira, e você escreve bem.',
        skills: ['Caligrafia', 'Heráldica', 'Preparar tintas', 'Mentir para guardas', 'Notar selos falsos'],
        startingItem: { name: 'Kit de Escriba', description: 'Kit de escriba com selos de cera roubados.', weight: 1 }
    },
    {
        id: 'contrabandista_sal',
        name: 'Contrabandista de Sal',
        class: 'parias',
        className: 'Os Párias e o Submundo',
        description: 'O sal é taxado pelo governo, você o trazia escondido.',
        skills: ['Rotas ocultas', 'Subornar oficiais', 'Esconder cargas em fundos falsos', 'Navegar pequenos barcos'],
        startingItem: { name: 'Mapa de Rotas', description: 'Um mapa com rotas "seguras" desatualizado.', weight: 0 }
    },
    {
        id: 'assassino_de_beco',
        name: 'Assassino de Beco',
        class: 'parias',
        className: 'Os Párias e o Submundo',
        description: 'Não um guerreiro honrado, mas alguém que resolve problemas por dinheiro.',
        skills: ['Misturar venenos simples', 'Atacar furtivamente', 'Limpar sangue de roupas', 'Intimidar'],
        startingItem: { name: 'Garrote', description: 'Uma corda de estrangulamento.', weight: 0 }
    },
    {
        id: 'mendigo_olheiro',
        name: 'Mendigo / Olheiro',
        class: 'parias',
        className: 'Os Párias e o Submundo',
        description: 'Você era os olhos e ouvidos da cidade.',
        skills: ['Passar despercebido', 'Ouvir conversas alheias', 'Fingir doenças', 'Conhecer a geografia urbana'],
        startingItem: { name: 'Roupas de Mendigo', description: 'Roupas que concedem +1 em Furtividade em multidões.', weight: 0 },
        specialRule: '+1 em Furtividade em multidões'
    },
    {
        id: 'agenciador_apostas',
        name: 'Agenciador de Apostas',
        class: 'parias',
        className: 'Os Párias e o Submundo',
        description: 'Onde há miséria, há jogo.',
        skills: ['Matemática rápida', 'Ler linguagem corporal', 'Cobrar dívidas', 'Correr muito rápido'],
        startingItem: { name: 'Dados Viciados', description: 'Um par de dados viciados.', weight: 0 }
    },
    {
        id: 'acompanhante',
        name: 'Acompanhante',
        class: 'parias',
        className: 'Os Párias e o Submundo',
        description: 'Corpos são mercadorias e você conhece a natureza humana.',
        skills: ['Sedução', 'Extrair segredos com conversa', 'Maquiagem e disfarce', 'Perceber intenções agressivas'],
        startingItem: { name: 'Punhal Oculto', description: 'Um punhal escondido em uma liga ou bota.', weight: 0, isWeapon: true }
    },

    // ========== CLASSE 2: O AÇO E O SANGUE ==========
    {
        id: 'desertor',
        name: 'Desertor da Legião',
        class: 'militares',
        className: 'O Aço e o Sangue',
        description: 'Você fugiu antes da batalha acabar.',
        skills: ['Marchar longas distâncias', 'Remendar botas', 'Se esconder em florestas', 'Roubar suprimentos'],
        startingItem: { name: 'Medalha Raspada', description: 'Uma medalha militar raspada.', weight: 0 }
    },
    {
        id: 'engenheiro_cerco',
        name: 'Engenheiro de Cerco',
        class: 'militares',
        className: 'O Aço e o Sangue',
        description: 'Derrubar muralhas é matemática, não força.',
        skills: ['Calcular trajetórias', 'Carpintaria pesada', 'Identificar pontos fracos em estruturas', 'Criar barricadas'],
        startingItem: { name: 'Ferramentas de Medição', description: 'Ferramentas de medição e um martelo pesado.', weight: 1 }
    },
    {
        id: 'carcereiro',
        name: 'Carcereiro / Torturador',
        class: 'militares',
        className: 'O Aço e o Sangue',
        description: 'Você trabalhava nas masmorras da Inquisição.',
        skills: ['Anatomia da dor', 'Dar nós complexos', 'Intimidar prisioneiros', 'Detectar mentiras'],
        startingItem: { name: 'Chaves Mestras', description: 'Um molho de chaves mestras antigas.', weight: 0 },
        penalty: 'Geralmente odiado por NPCs bondosos'
    },
    {
        id: 'escudeiro',
        name: 'Escudeiro Fracassado',
        class: 'militares',
        className: 'O Aço e o Sangue',
        description: 'Você serviu um cavaleiro, mas nunca foi nomeado.',
        skills: ['Polir armaduras', 'Cuidar de cavalos', 'Etiqueta básica de combate', 'História da nobreza'],
        startingItem: { name: 'Cota de Malha Parcial', description: 'Um pedaço de cota de malha (RD 1 apenas no peito).', weight: 1 },
        specialRule: '+1 RD (apenas peito)'
    },
    {
        id: 'mercenario',
        name: 'Mercenário de Companhia Livre',
        class: 'militares',
        className: 'O Aço e o Sangue',
        description: 'Sua lealdade pertence a quem paga.',
        skills: ['Negociar contratos', 'Avaliar armas', 'Táticas de escaramuça', 'Beber muito sem cair'],
        startingItem: { name: 'Contrato de Dívida', description: 'Um contrato de dívida que alguém deve a você.', weight: 0 }
    },
    {
        id: 'batedor',
        name: 'Batedor de Fronteira',
        class: 'militares',
        className: 'O Aço e o Sangue',
        description: 'Você vigiava os limites contra os bárbaros ou bestas.',
        skills: ['Rastrear', 'Montar armadilhas', 'Ver no escuro', 'Sinalizar com espelhos/fumaça'],
        startingItem: { name: 'Luneta Rachada', description: 'Uma luneta rachada.', weight: 0 }
    },
    {
        id: 'medico_campo',
        name: 'Médico de Campo',
        class: 'militares',
        className: 'O Aço e o Sangue',
        description: 'Quando o soldado cai, você serra a perna.',
        skills: ['Amputar membros rapidamente', 'Estancar hemorragias', 'Costurar carne', 'Ignorar gritos de dor'],
        startingItem: { name: 'Serra de Ossos', description: 'Uma serra de ossos (Conta como Adaga, +1 Dano contra Humanoides).', weight: 1, isWeapon: true },
        specialRule: '+1 Dano contra Humanoides'
    },
    {
        id: 'guarda_caravana',
        name: 'Guarda de Caravana',
        class: 'militares',
        className: 'O Aço e o Sangue',
        description: 'Protegendo cargas em estradas lamacentas.',
        skills: ['Ficar acordado por dias', 'Consertar rodas de carroça', 'Prever o clima', 'Combate montado'],
        startingItem: { name: 'Apito de Alerta', description: 'Um apito de alerta.', weight: 0 }
    },

    // ========== CLASSE 3: O SUOR E A TERRA ==========
    {
        id: 'lenhador',
        name: 'Lenhador',
        class: 'trabalhadores',
        className: 'O Suor e a Terra',
        description: 'A floresta é escura e cheia de horrores, mas as árvores precisam cair.',
        skills: ['Derrubar árvores e portas', 'Sobreviver na mata', 'Identificar madeira podre', 'Força bruta'],
        startingItem: { name: 'Machado de Lenhador', description: 'Um machado de lenhador (Dano 3, Pesado).', weight: 2, isWeapon: true },
        specialRule: 'Machado: Dano 3, Pesado'
    },
    {
        id: 'ferreiro',
        name: 'Ferreiro de Vila',
        class: 'trabalhadores',
        className: 'O Suor e a Terra',
        description: 'O metal obedece ao fogo e à batida.',
        skills: ['Consertar armas e armaduras', 'Avaliar minérios', 'Resistência ao calor', 'Força nos braços'],
        startingItem: { name: 'Martelo de Forja', description: 'Um martelo de forja e tenazes.', weight: 1 }
    },
    {
        id: 'mineiro',
        name: 'Mineiro de Profundidade',
        class: 'trabalhadores',
        className: 'O Suor e a Terra',
        description: 'Você cavou fundo demais e viu coisas que não devia.',
        skills: ['Navegar subterrâneos', 'Detectar gases tóxicos', 'Explodir rochas', 'Ver na penumbra'],
        startingItem: { name: 'Picareta e Canário', description: 'Uma picareta e um canário (para detectar gás).', weight: 1 }
    },
    {
        id: 'marinheiro',
        name: 'Marinheiro / Pescador',
        class: 'trabalhadores',
        className: 'O Suor e a Terra',
        description: 'O mar é cruel, mas o céu é pior.',
        skills: ['Dar nós', 'Nadar', 'Prever tempestades', 'Usar arpões/redes', 'Navegar pelas estrelas'],
        startingItem: { name: 'Gancho de Mão', description: 'Um gancho de mão ou rede de pesca.', weight: 1 }
    },
    {
        id: 'estalajadeiro',
        name: 'Estalajadeiro / Cozinheiro',
        class: 'trabalhadores',
        className: 'O Suor e a Terra',
        description: 'Você alimentava viajantes e ouvia histórias.',
        skills: ['Cozinhar monstros', 'Ouvir fofocas', 'Acalmar bêbados', 'Gerenciar recursos'],
        startingItem: { name: 'Cutelo e Especiarias', description: 'Uma faca de cutelo e um saco de especiarias (vale ouro em lugares ruins).', weight: 1 }
    },
    {
        id: 'pedreiro',
        name: 'Pedreiro / Arquiteto',
        class: 'trabalhadores',
        className: 'O Suor e a Terra',
        description: 'Você construía as catedrais que agora parecem prisões.',
        skills: ['Encontrar passagens secretas', 'Avaliar estabilidade de ruínas', 'Desenhar mapas'],
        startingItem: { name: 'Kit de Pedreiro', description: 'Prumo, giz e corda.', weight: 1 }
    },
    {
        id: 'pastor',
        name: 'Pastor de Ovelhas',
        class: 'trabalhadores',
        className: 'O Suor e a Terra',
        description: 'Solitário, vigilante e bom com a funda.',
        skills: ['Adestrar cães', 'Perceber predadores', 'Dormir ao relento', 'Usar a funda'],
        startingItem: { name: 'Cão Pastor', description: 'Um cão pastor (NPC animal simples) ou um cajado.', weight: 0 }
    },

    // ========== CLASSE 4: A PENA E O INCENSO ==========
    {
        id: 'astronomo',
        name: 'Astrônomo Herege',
        class: 'eruditos',
        className: 'A Pena e o Incenso',
        description: 'Você olhou para cima. Foi seu primeiro erro.',
        skills: ['Identificar os Astros', 'Calcular ciclos lunares', 'Ler línguas mortas', 'Matemática avançada'],
        startingItem: { name: 'Astrolábio Quebrado', description: 'Um astrolábio quebrado e óculos escuros.', weight: 0 },
        penalty: 'A Inquisição te mata se descobrir'
    },
    {
        id: 'sacerdote',
        name: 'Sacerdote da Ordem Solar',
        class: 'eruditos',
        className: 'A Pena e o Incenso',
        description: 'Você pregava a "luz", mas descobriu que ela queima.',
        skills: ['Teologia', 'Oratória', 'Rituais funerários', 'Ler e escrever'],
        startingItem: { name: 'Símbolo Sagrado', description: 'Um símbolo sagrado de ouro e vestes cerimoniais.', weight: 0 }
    },
    {
        id: 'alquimista',
        name: 'Alquimista de Beco',
        class: 'eruditos',
        className: 'A Pena e o Incenso',
        description: 'Tentando transformar chumbo em ouro, ou pelo menos em veneno.',
        skills: ['Identificar poções', 'Criar ácidos/explosivos simples', 'Tratar doenças químicas'],
        startingItem: { name: 'Frascos de Ácido', description: '2 frascos de Ácido Fraco (1d6 dano) e vidro.', weight: 1 },
        specialRule: '2x Ácido Fraco: 1d6 dano'
    },
    {
        id: 'bibliotecario',
        name: 'Bibliotecário / Arquivista',
        class: 'eruditos',
        className: 'A Pena e o Incenso',
        description: 'O papel corta mais que a espada.',
        skills: ['Pesquisar rápido', 'Organizar informações', 'Proteger papel da umidade', 'História antiga'],
        startingItem: { name: 'Tubo de Pergaminhos', description: 'Um tubo de pergaminhos selado (conteúdo desconhecido).', weight: 0 }
    },
    {
        id: 'medico_peste',
        name: 'Médico da Peste',
        class: 'eruditos',
        className: 'A Pena e o Incenso',
        description: 'Aqueles que entravam nas casas marcadas com X.',
        skills: ['Diagnosticar doenças', 'Usar máscaras de filtro', 'Queimar corpos', 'Amputação'],
        startingItem: { name: 'Máscara de Bico', description: 'Máscara de bico (resistência a doenças aéreas) e incenso.', weight: 0 },
        specialRule: 'Resistência a doenças aéreas'
    },
    {
        id: 'advogado',
        name: 'Advogado / Burocrata',
        class: 'eruditos',
        className: 'A Pena e o Incenso',
        description: 'As leis dos homens são complexas e cruéis.',
        skills: ['Achar brechas em contratos', 'Subornar legalmente', 'Etiqueta', 'Oratória'],
        startingItem: { name: 'Livro de Leis', description: 'Um livro de leis local e um selo oficial.', weight: 1 }
    },
    {
        id: 'artista',
        name: 'Artista / Músico',
        class: 'eruditos',
        className: 'A Pena e o Incenso',
        description: 'Sua arte tentou capturar a beleza do mundo, mas falhou.',
        skills: ['Tocar instrumentos', 'Distrair multidões', 'Imitar vozes', 'Desenhar retratos falados'],
        startingItem: { name: 'Instrumento Musical', description: 'Um instrumento musical (se quebrar, perde 1 de Sal).', weight: 1 },
        penalty: 'Se o instrumento quebrar, perde 1 de Sal pela tristeza'
    },

    // ========== CLASSE 5: OS ESTRANHOS ==========
    {
        id: 'sobrevivente',
        name: 'Único Sobrevivente',
        class: 'estranhos',
        className: 'Os Estranhos',
        description: 'Sua vila inteira morreu. Só sobrou você.',
        skills: ['Esconder-se', 'Tolerância à dor absurda', 'Instinto de perigo'],
        startingItem: { name: 'Lembrança de Família', description: 'Uma lembrança de família manchada de sangue.', weight: 0 }
    },
    {
        id: 'crianca_selvagem',
        name: 'Criança Selvagem',
        class: 'estranhos',
        className: 'Os Estranhos',
        description: 'Criado por lobos ou nas ruínas.',
        skills: ['Mimetismo animal', 'Escalar árvores', 'Comer carne crua sem passar mal', 'Furtividade'],
        startingItem: { name: 'Dentes Afiados', description: 'Nenhum item. Dentes afiados: dano desarmado +1.', weight: 0 },
        specialRule: 'Dano desarmado +1',
        penalty: 'Fala com dificuldade (-1 em Sal para etiqueta)'
    },
    {
        id: 'cultista',
        name: 'Cultista Arrependido',
        class: 'estranhos',
        className: 'Os Estranhos',
        description: 'Você serviu a uma seita do Eclipse, mas fugiu.',
        skills: ['Sinais secretos de cultistas', 'Rituais profanos', 'Resistir a tortura mental'],
        startingItem: { name: 'Adaga Cerimonial', description: 'Uma adaga cerimonial curva (Dano 2).', weight: 1, isWeapon: true }
    },
    {
        id: 'nobre_deserdado',
        name: 'Nobre Deserdado',
        class: 'estranhos',
        className: 'Os Estranhos',
        description: 'Você tinha tudo, agora tem apenas seu nome e arrogância.',
        skills: ['Duelar (esgrima)', 'Etiqueta', 'Heráldica', 'Comandar servos'],
        startingItem: { name: 'Anel de Sinete', description: 'Um anel de sinete (vale 100 Limalhas, mas se vender perde sua identidade).', weight: 0 },
        specialRule: 'Anel vale 100 Limalhas (mas perde identidade se vender)'
    }
];
