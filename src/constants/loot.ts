import { WEAPON_CATALOG } from "../constants";

export interface LootItem {
    id: string;
    name: string;
    type: 'weapon' | 'consumable' | 'general';
    data?: any;
    description: string;
    weight?: number;
}

export const GM_LOOT: LootItem[] = [
    // --- ARMAS ESPECIAIS ---
    {
        id: 'plasma_sword',
        name: 'Lâmina de Plasma (Relíquia)',
        type: 'weapon',
        description: "Uma tecnologia proibida. Corta pedra como manteiga.",
        data: {
            ...WEAPON_CATALOG.find(w => w.catalogId === 'espada'),
            name: 'Lâmina de Plasma',
            damage: 4,
            properties: ['Perfurante', 'Luminosa'],
            description: 'Ignora armadura. Crítico: Cauteriza (sem sangramento).'
        }
    },
    {
        id: 'meteor_hammer',
        name: 'Martelo de Meteorito',
        type: 'weapon',
        description: "Pesado e vibra com energia estranha.",
        data: {
            ...WEAPON_CATALOG.find(w => w.catalogId === 'montante'),
            name: 'Martelo Estelar',
            damage: 5,
            properties: ['Pesada', 'Impacto'],
            description: 'Crítico: Derruba inimigos Enormes.'
        }
    },

    // --- CONSUMÍVEIS ---
    {
        id: 'lead_refill',
        name: 'Dose de Chumbo Líquido',
        type: 'consumable',
        description: "Recarrega 1 uso de Chumbo.",
        data: { targetId: 'lead', amount: 1 }
    },
    {
        id: 'serum_pack',
        name: 'Pacote de Soro (x2)',
        type: 'consumable',
        description: "Recarrega 2 usos de Soro Estelar.",
        data: { targetId: 'serum', amount: 2 }
    },
    {
        id: 'ration_pack',
        name: 'Ração de Viagem (x1)',
        type: 'consumable',
        description: "Comida essencial para descanso longo.",
        data: { targetId: 'ration', amount: 1 }
    },
    {
        id: 'salts_pack',
        name: 'Sais de Cheiro (x1)',
        type: 'consumable',
        description: "Recupera condições mentais.",
        data: { targetId: 'salts', amount: 1 }
    },
    {
        id: 'poppy_pack',
        name: 'Papoula Branca(x1)',
        type: 'consumable',
        description: "Recarrega 1 uso de Papoula. Alivia a dor corporal.",
        data: { targetId: 'poppy', amount: 1 }
    },

    // --- GERAIS (Vai para o inventário de texto) ---
    {
        id: 'old_map',
        name: 'Mapa da Cidadela',
        type: 'general',
        description: "Um mapa antigo mostrando túneis de esgoto."
    },
    {
        id: 'key_rust',
        name: 'Chave Enferrujada',
        type: 'general',
        description: "Abre a porta do setor 4."
    }
];
