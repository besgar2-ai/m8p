// Heurística para convertir texto libre (pegado de Instagram, notas, etc.) en
// ingredientes estructurados. Es orientativa: el resultado siempre debe poder
// revisarse y corregirse a mano antes de guardar.

const UNIT_ALIASES = {
    g: 'g', gr: 'g', gramo: 'g', gramos: 'g',
    kg: 'kg',
    ml: 'ml', l: 'l', litro: 'l', litros: 'l',
    cda: 'cda', cdas: 'cda', cucharada: 'cda', cucharadas: 'cda',
    cdta: 'cdta', cdtas: 'cdta', cucharadita: 'cdta', cucharaditas: 'cdta',
    ud: 'ud', uds: 'ud', unidad: 'ud', unidades: 'ud',
    rebanada: 'rebanadas', rebanadas: 'rebanadas',
    cacito: 'cacito', cacitos: 'cacito',
    bolsa: 'bolsa', bolsas: 'bolsa',
    taza: 'taza', tazas: 'taza',
    diente: 'ud', dientes: 'ud',
    pizca: 'cdta', pizcas: 'cdta',
};

const STEP_VERBS = [
    'cocina', 'cocinar', 'hornea', 'hornear', 'mezcla', 'mezclar', 'saltea', 'saltear',
    'añade', 'anade', 'añadir', 'anadir', 'sirve', 'servir', 'corta', 'cortar', 'bate', 'batir',
    'calienta', 'calentar', 'remueve', 'remover', 'cuece', 'cocer', 'pica', 'picar',
    'tritura', 'triturar', 'deja', 'dejar', 'precalienta', 'precalentar', 'incorpora', 'incorporar', 'vierte', 'verter',
];

function normalizeUnit(rawUnit, qty) {
    if (!rawUnit) return { unit: 'ud', qty };
    const key = rawUnit.toLowerCase();
    const mapped = UNIT_ALIASES[key];
    if (!mapped) return null;
    if (mapped === 'kg') return { unit: 'g', qty: qty * 1000 };
    if (mapped === 'l') return { unit: 'ml', qty: qty * 1000 };
    if (mapped === 'taza') return { unit: 'ml', qty: qty * 240 };
    return { unit: mapped, qty };
}

function parseQuantity(str) {
    if (str.includes('/')) {
        const [a, b] = str.split('/').map(Number);
        if (b) return a / b;
    }
    return parseFloat(str.replace(',', '.'));
}

function cleanLine(line) {
    return line
        .replace(/^[\s\-•*▪️✔️✅👉➡️→]+/, '')
        .replace(/^\d+[.)]\s*/, '')
        .replace(/^paso\s*\d+\s*[:.-]?\s*/i, '')
        .trim();
}

function isHashtagLine(line) {
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length === 0) return false;
    const hashtagWords = words.filter(w => w.startsWith('#'));
    return hashtagWords.length / words.length > 0.6;
}

function looksLikeStep(line) {
    const lower = line.toLowerCase();
    const wordCount = line.split(/\s+/).length;
    if (wordCount > 9) return true;
    return STEP_VERBS.some(v => lower.startsWith(v + ' ') || lower.includes(' ' + v + ' '));
}

function tryParseIngredientLine(line) {
    const qtyMatch = line.match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
    if (!qtyMatch) return null;

    const qty = parseQuantity(qtyMatch[1]);
    if (isNaN(qty)) return null;
    let rest = qtyMatch[2].trim();

    const wordMatch = rest.match(/^([a-záéíóúñ]+)\b\.?\s*(.*)$/i);
    if (wordMatch) {
        const normalized = normalizeUnit(wordMatch[1], qty);
        if (normalized) {
            let name = wordMatch[2].trim();
            name = name.replace(/^de\s+/i, '');
            if (name) {
                return { qty: Math.round(normalized.qty * 100) / 100, unit: normalized.unit, name: name.toLowerCase() };
            }
        }
    }

    rest = rest.replace(/^de\s+/i, '');
    if (!rest) return null;
    return { qty: Math.round(qty * 100) / 100, unit: 'ud', name: rest.toLowerCase() };
}

export function parseRecipeText(rawText) {
    const lines = rawText.split(/\r?\n/).map(cleanLine).filter(Boolean);
    const ingredients = [];
    const steps = [];
    let name = '';

    lines.forEach((line, idx) => {
        if (isHashtagLine(line)) return;

        if (idx === 0 && !name && !/^[\d/]/.test(line) && line.split(/\s+/).length <= 8 && !looksLikeStep(line)) {
            name = line;
            return;
        }

        if (looksLikeStep(line)) {
            steps.push(line);
            return;
        }

        const parsed = tryParseIngredientLine(line);
        if (parsed) {
            ingredients.push(parsed);
            return;
        }

        if (line.split(/\s+/).length <= 6) {
            ingredients.push({ qty: '', unit: 'g', name: line.toLowerCase() });
        } else {
            steps.push(line);
        }
    });

    return { name, ingredients, steps };
}
