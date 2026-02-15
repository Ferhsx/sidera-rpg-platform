import { z } from 'zod';

export const AttributesSchema = z.object({
    ferro: z.number().int().min(0),
    mercurio: z.number().int().min(0),
    enxofre: z.number().int().min(0),
    sal: z.number().int().min(0),
});

export const InventorySlotSchema = z.object({
    name: z.string(),
    description: z.string(),
    weight: z.number().min(0),
    isConsumed: z.boolean(),
});

export const WeaponSchema = z.object({
    id: z.string(),
    catalogId: z.string(),
    name: z.string(),
    damage: z.number(),
    category: z.enum(['Improvised', 'Light', 'Medium', 'Heavy', 'Ranged', 'Firearm', 'Shield']),
    properties: z.array(z.string()),
    range: z.string(),
    cost: z.number(),
    weight: z.number(),
    status: z.enum(['ready', 'dropped', 'broken']),
    currentAmmo: z.number().optional(),
    maxAmmo: z.number().optional(),
    description: z.string().optional(),
});

export const ConditionSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['buff', 'debuff', 'neutral']),
    durationInRounds: z.number().optional(),
    mechanic: z.enum(['nausea', 'invisible', 'stimulated']).optional(),
});

export const ConsumableSchema = z.object({
    id: z.enum(['lead', 'serum', 'poppy', 'salts', 'ration']),
    name: z.string(),
    quantity: z.number().int().min(0),
});

export const CustomAbilitySchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    cost: z.string().optional(),
    type: z.enum(['PASSIVA', 'ATIVA', 'REAÇÃO', 'MALDICÃO']),
});

export const CharacterDataSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    background: z.string(),
    archetypeId: z.string(),
    attributes: AttributesSchema,
    currentHp: z.number().int(),
    maxHp: z.number().int(),
    orbit: z.number().int().min(0).max(10), // Assuming max orbit is 10 based on UI usually
    deathFailures: z.number().int().min(0),
    isStabilized: z.boolean(),
    pendingScar: z.boolean(),
    scars: z.array(z.string()),
    armorRating: z.number().int(),
    armorName: z.string(),
    silver: z.number().int().min(0),
    inventorySlots: z.array(InventorySlotSchema),
    notes: z.string(),
    arsenal: z.array(WeaponSchema),
    conditions: z.array(ConditionSchema),
    beltPouch: z.array(ConsumableSchema),
    wizardCompleted: z.boolean(),
    imageUrl: z.string().optional(),
    customAbilities: z.array(CustomAbilitySchema),
});

export const PartialCharacterDataSchema = CharacterDataSchema.partial();
