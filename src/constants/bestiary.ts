export interface EnemyTemplate {
    id: string;
    name: string;
    hp: number;
    orbit: number; // Nível de perigo/poder
    attacks: { name: string; damage: number; effect?: string }[];
    passive?: string;
    description?: string;
    imageUrl?: string; // Novo: Imagem do Monstro
}

export const BESTIARY: EnemyTemplate[] = [
    {
        id: 'cultist',
        name: 'Cultista da Ferrugem',
        hp: 6,
        orbit: 2,
        attacks: [
            { name: 'Adaga Enferrujada', damage: 2, effect: 'Tétano (Dano contínuo se não tratar)' }
        ],
        passive: 'Fanatismo: Nunca foge.',
        imageUrl: 'https://images.unsplash.com/photo-1542256863-71ab5162a8dc?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'wolf',
        name: 'Lobo de Pedra',
        hp: 12,
        orbit: 5,
        attacks: [
            { name: 'Mordida Trituradora', damage: 4, effect: 'Derruba o alvo' },
            { name: 'Garras', damage: 2 }
        ],
        passive: 'Pele Rochosa: RD 2 contra cortes.',
        imageUrl: 'https://images.unsplash.com/photo-1518700938150-edb11402212a?q=80&w=600&auto=format&fit=crop' // Example wolf image
    },
    {
        id: 'horror',
        name: 'Horror Solar',
        hp: 20,
        orbit: 10,
        attacks: [
            { name: 'Radiação Térmica', damage: 1, effect: 'Área (Todos num raio de 5m)' },
            { name: 'Toque de Plasma', damage: 6, effect: 'Derrete armadura (-1 RD permanente)' }
        ],
        passive: 'Brilho Cegante: Ataques contra ele têm Desvantagem.',
        imageUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab59d1?q=80&w=600&auto=format&fit=crop' // Example cosmic horror image
    }
];
