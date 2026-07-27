import { getRecipe } from './recipeData.js';

const CATEGORY_MAP = {
    'frutos rojos': 'Verduras y frutas', 'espinacas': 'Verduras y frutas', 'aguacate': 'Verduras y frutas',
    'plátano': 'Verduras y frutas', 'tomate': 'Verduras y frutas', 'manzana': 'Verduras y frutas',
    'brócoli': 'Verduras y frutas', 'calabacín': 'Verduras y frutas', 'zanahoria': 'Verduras y frutas',
    'pimiento': 'Verduras y frutas', 'cebolla': 'Verduras y frutas', 'pepino': 'Verduras y frutas',
    'tomate cherry': 'Verduras y frutas', 'boniato': 'Verduras y frutas', 'champiñones': 'Verduras y frutas',
    'calabaza': 'Verduras y frutas', 'brotes de soja': 'Verduras y frutas', 'patata': 'Verduras y frutas',
    'limón': 'Verduras y frutas', 'ensalada verde': 'Verduras y frutas',

    'claras de huevo': 'Proteína', 'huevo': 'Proteína', 'pechuga de pollo': 'Proteína',
    'salmón': 'Proteína', 'ternera en tiras': 'Proteína', 'merluza': 'Proteína',
    'pescado blanco': 'Proteína', 'jamón serrano': 'Proteína', 'gambas peladas': 'Proteína',

    'yogur griego natural': 'Lácteos', 'leche': 'Lácteos', 'requesón': 'Lácteos',
    'queso feta': 'Lácteos', 'yogur natural': 'Lácteos', 'queso fresco batido': 'Lácteos',

    'arroz integral': 'Cereales y legumbres', 'fideos de arroz': 'Cereales y legumbres',
    'pan sin gluten': 'Cereales y legumbres', 'copos de avena sin gluten': 'Cereales y legumbres',
    'quinoa': 'Cereales y legumbres', 'lentejas': 'Cereales y legumbres', 'garbanzos cocidos': 'Cereales y legumbres',
};

const CATEGORY_ORDER = ['Verduras y frutas', 'Proteína', 'Lácteos', 'Cereales y legumbres', 'Otros'];

function categoryOf(name) {
    return CATEGORY_MAP[name] ?? 'Otros';
}

export function buildShoppingList(plan) {
    const totals = new Map();
    plan.days.forEach(day => {
        day.meals.forEach(meal => {
            const recipe = getRecipe(meal.recipeId);
            recipe.ingredients.forEach(ing => {
                if (ing.pantry) return;
                const key = `${ing.name}|${ing.unit}`;
                const existing = totals.get(key);
                if (existing) existing.qty += ing.qty;
                else totals.set(key, { key, name: ing.name, unit: ing.unit, qty: ing.qty });
            });
        });
    });

    const items = [...totals.values()].sort((a, b) => a.name.localeCompare(b.name));
    const grouped = {};
    items.forEach(item => {
        const cat = categoryOf(item.name);
        (grouped[cat] ??= []).push(item);
    });

    return CATEGORY_ORDER
        .filter(cat => grouped[cat]?.length)
        .map(cat => ({ category: cat, items: grouped[cat] }));
}

export function formatQty(item) {
    const qty = Number.isInteger(item.qty) ? item.qty : item.qty.toFixed(1).replace(/\.0$/, '');
    const unit = item.unit === 'ud' ? '' : item.unit;
    return [qty, unit].filter(Boolean).join(' ');
}
