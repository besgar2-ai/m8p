// Valores aproximados (por 100g/100ml salvo que se indique gramsPerUnit) para estimar
// calorías y macros de recetas propias. Son estimaciones orientativas, no datos de laboratorio.
export const NUTRITION_DB = {
    'pechuga de pollo': { kcal100: 165, protein100: 31, carbs100: 0, fat100: 3.6 },
    'salmón': { kcal100: 208, protein100: 20, carbs100: 0, fat100: 13 },
    'merluza': { kcal100: 90, protein100: 18, carbs100: 1, fat100: 1.3 },
    'pescado blanco': { kcal100: 85, protein100: 18, carbs100: 0, fat100: 1 },
    'ternera en tiras': { kcal100: 250, protein100: 26, carbs100: 0, fat100: 15 },
    'gambas peladas': { kcal100: 99, protein100: 24, carbs100: 0.2, fat100: 0.3 },
    'jamón serrano': { kcal100: 241, protein100: 31, carbs100: 0, fat100: 13 },
    'huevo': { kcal100: 155, protein100: 13, carbs100: 1.1, fat100: 11, gramsPerUnit: 55 },
    'claras de huevo': { kcal100: 52, protein100: 11, carbs100: 0.7, fat100: 0.2, gramsPerUnit: 33 },
    'yogur griego natural': { kcal100: 97, protein100: 9, carbs100: 4, fat100: 5 },
    'yogur natural': { kcal100: 61, protein100: 3.5, carbs100: 4.7, fat100: 3.3 },
    'requesón': { kcal100: 98, protein100: 11, carbs100: 3.4, fat100: 4.3 },
    'queso feta': { kcal100: 264, protein100: 14, carbs100: 4, fat100: 21 },
    'queso fresco batido': { kcal100: 75, protein100: 9, carbs100: 3, fat100: 3 },
    'leche': { kcal100: 42, protein100: 3.4, carbs100: 5, fat100: 1 },
    'arroz integral': { kcal100: 111, protein100: 2.6, carbs100: 23, fat100: 0.9 },
    'fideos de arroz': { kcal100: 109, protein100: 2, carbs100: 25, fat100: 0.2 },
    'quinoa': { kcal100: 120, protein100: 4.4, carbs100: 21, fat100: 1.9 },
    'copos de avena sin gluten': { kcal100: 379, protein100: 13, carbs100: 67, fat100: 7 },
    'pan sin gluten': { kcal100: 260, protein100: 3, carbs100: 52, fat100: 4, gramsPerUnit: 30 },
    'lentejas': { kcal100: 116, protein100: 9, carbs100: 20, fat100: 0.4 },
    'garbanzos cocidos': { kcal100: 164, protein100: 8.9, carbs100: 27, fat100: 2.6 },
    'patata': { kcal100: 77, protein100: 2, carbs100: 17, fat100: 0.1 },
    'boniato': { kcal100: 86, protein100: 1.6, carbs100: 20, fat100: 0.1 },
    'calabaza': { kcal100: 26, protein100: 1, carbs100: 6.5, fat100: 0.1 },
    'brócoli': { kcal100: 34, protein100: 2.8, carbs100: 7, fat100: 0.4 },
    'espinacas': { kcal100: 23, protein100: 2.9, carbs100: 3.6, fat100: 0.4 },
    'calabacín': { kcal100: 17, protein100: 1.2, carbs100: 3.1, fat100: 0.3, gramsPerUnit: 200 },
    'zanahoria': { kcal100: 41, protein100: 0.9, carbs100: 10, fat100: 0.2, gramsPerUnit: 70 },
    'pimiento': { kcal100: 31, protein100: 1, carbs100: 6, fat100: 0.3, gramsPerUnit: 120 },
    'cebolla': { kcal100: 40, protein100: 1.1, carbs100: 9.3, fat100: 0.1, gramsPerUnit: 110 },
    'champiñones': { kcal100: 22, protein100: 3.1, carbs100: 3.3, fat100: 0.3 },
    'tomate': { kcal100: 18, protein100: 0.9, carbs100: 3.9, fat100: 0.2, gramsPerUnit: 120 },
    'tomate cherry': { kcal100: 18, protein100: 0.9, carbs100: 3.9, fat100: 0.2 },
    'tomate triturado': { kcal100: 32, protein100: 1.6, carbs100: 7, fat100: 0.3 },
    'pepino': { kcal100: 15, protein100: 0.7, carbs100: 3.6, fat100: 0.1, gramsPerUnit: 150 },
    'brotes de soja': { kcal100: 30, protein100: 3, carbs100: 5.9, fat100: 0.2 },
    'ensalada verde': { kcal100: 15, protein100: 1.4, carbs100: 2.9, fat100: 0.2, gramsPerUnit: 50 },
    'aguacate': { kcal100: 160, protein100: 2, carbs100: 8.5, fat100: 14.7, gramsPerUnit: 200 },
    'plátano': { kcal100: 89, protein100: 1.1, carbs100: 23, fat100: 0.3, gramsPerUnit: 120 },
    'manzana': { kcal100: 52, protein100: 0.3, carbs100: 14, fat100: 0.2, gramsPerUnit: 180 },
    'limón': { kcal100: 29, protein100: 1.1, carbs100: 9.3, fat100: 0.3, gramsPerUnit: 60 },
    'frutos rojos': { kcal100: 43, protein100: 0.7, carbs100: 10, fat100: 0.3 },
    'nueces': { kcal100: 654, protein100: 15, carbs100: 14, fat100: 65 },
    'almendras': { kcal100: 579, protein100: 21, carbs100: 22, fat100: 50 },
    'semillas de chía': { kcal100: 486, protein100: 17, carbs100: 42, fat100: 31 },
    'mantequilla de cacahuete': { kcal100: 588, protein100: 25, carbs100: 20, fat100: 50 },
    'miel': { kcal100: 304, protein100: 0.3, carbs100: 82, fat100: 0, gramsPerUnit: 7 },
    'hummus': { kcal100: 166, protein100: 8, carbs100: 14, fat100: 9.6 },
    'proteína en polvo sin gluten': { kcal100: 380, protein100: 75, carbs100: 8, fat100: 5, gramsPerUnit: 30 },
    'caldo de verduras': { kcal100: 5, protein100: 0.3, carbs100: 0.9, fat100: 0.1 },
    'salsa de soja sin gluten': { kcal100: 53, protein100: 8, carbs100: 5, fat100: 0, gramsPerUnit: 15 },
    'aceite de oliva': { kcal100: 884, protein100: 0, carbs100: 0, fat100: 100, gramsPerUnit: 10 },
};

const UNIT_FALLBACK_GRAMS = {
    ud: 100, cda: 15, cdta: 5, rebanadas: 30, cacito: 30, bolsa: 50, g: 1, ml: 1,
};

export function findNutritionEntry(name) {
    return NUTRITION_DB[name.trim().toLowerCase()] ?? null;
}

export function estimateIngredient(qty, unit, name) {
    const entry = findNutritionEntry(name);
    if (!entry || !qty) return null;

    let grams;
    if (unit === 'g' || unit === 'ml') grams = qty;
    else grams = qty * (entry.gramsPerUnit ?? UNIT_FALLBACK_GRAMS[unit] ?? 100);

    const factor = grams / 100;
    return {
        kcal: entry.kcal100 * factor,
        protein: entry.protein100 * factor,
        carbs: entry.carbs100 * factor,
        fat: entry.fat100 * factor,
    };
}

export function estimateRecipeTotals(ingredients) {
    const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    const unrecognized = [];
    ingredients.forEach(ing => {
        const est = estimateIngredient(ing.qty, ing.unit, ing.name);
        if (est) {
            totals.kcal += est.kcal;
            totals.protein += est.protein;
            totals.carbs += est.carbs;
            totals.fat += est.fat;
        } else if (ing.name?.trim()) {
            unrecognized.push(ing.name.trim());
        }
    });
    return {
        calories: Math.round(totals.kcal),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
        unrecognized,
    };
}

export const INGREDIENT_NAMES = Object.keys(NUTRITION_DB).sort();
