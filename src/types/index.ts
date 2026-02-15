import { ReactNode } from 'react';

export interface Archetype {
    id: string;
    name: string;
    planet: string;
    type: 'Leve' | 'Médio' | 'Pesado'; // Weight class
    bonusHp: number;
    primaryAttribute: keyof Attributes;
    description: string;
    passive: string;
    manifestation: string;
    flaw: string;
}

export type AbilityType = 'PASSIVA' | 'ATIVA' | 'REAÇÃO' | 'MALDICÃO';

export interface CustomAbility {
    id: string;
    name: string;
    description: string;
    cost?: string; // Ex: "1 Órbita", "1 Ação", "3 PV"
    type: AbilityType;
}

export enum OrbitStage {
    HUMAN = 'Humano',
    SYMPTOMATIC = 'Sintomático',
    CRITICAL = 'Crítico',
    ECLIPSE = 'Eclipse'
}

export interface Pillar {
    title: string;
    description: string;
    icon: 'skull' | 'star' | 'scale';
}

export interface Attributes {
    ferro: number;
    mercurio: number;
    enxofre: number;
    sal: number;
}

export interface InventorySlot {
    name: string;
    description: string;
    weight: number; // 1 = normal item, 2 = heavy, 0 = negligible
    isConsumed: boolean; // True if item has been used/spent
}

export type WeaponCategory = 'Improvised' | 'Light' | 'Medium' | 'Heavy' | 'Ranged' | 'Firearm' | 'Shield';
export type WeaponStatus = 'ready' | 'dropped' | 'broken';

export type ConditionType = 'buff' | 'debuff' | 'neutral';

export interface Condition {
    id: string;
    name: string; // Ex: "Enjoado", "Invisível"
    description: string; // Ex: "-1 em Físico"
    type: ConditionType;
    durationInRounds?: number; // Se undefined, é permanente até ser removido
    mechanic?: 'nausea' | 'invisible' | 'stimulated'; // Tags para automação
}

export interface Consumable {
    id: 'lead' | 'serum' | 'poppy' | 'salts' | 'ration';
    name: string;
    quantity: number;
}

export interface Weapon {
    id: string; // ID único da instância (para ter 2 adagas diferentes)
    catalogId: string; // ID do tipo (ex: 'faca')
    name: string;
    damage: number;
    category: WeaponCategory;
    properties: string[];
    range: string;
    cost: number; // Em LP
    weight: number; // Novo: Peso do item (0, 1, 2)
    status: WeaponStatus;
    currentAmmo?: number; // Para ranged
    maxAmmo?: number;     // Se > 0, exige recarga
    description?: string; // Flavor ou regra extra
}

export interface CharacterData {
    name: string;
    background: string;
    archetypeId: string;
    attributes: Attributes;
    currentHp: number;
    maxHp: number; // Calculated
    orbit: number;
    deathFailures: number;
    isStabilized: boolean;
    pendingScar: boolean; // True when player needs to roll for a scar after surviving death
    scars: string[]; // List of permanent scars/sequelae
    armorRating: number;
    armorName: string;
    silver: number;
    inventorySlots: InventorySlot[]; // Slot-based inventory
    notes: string;
    arsenal: Weapon[]; // Added arsenal for combat
    conditions: Condition[];
    beltPouch: Consumable[]; // Inventário rápido separado
    wizardCompleted: boolean;
    imageUrl?: string; // Novo: Avatar Visual
    customAbilities: CustomAbility[]; // Novo campo
}

export interface LootItem {
    type: 'weapon' | 'consumable' | 'general';
    name: string;
    description: string;
    weight?: number;
    data?: any; // To store specific data like weapon stats or consumable ID
}
