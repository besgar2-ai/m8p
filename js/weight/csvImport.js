// Parser tolerante para CSV exportados de apps de báscula (formato exacto de FitDays no documentado
// públicamente, así que se buscan cabeceras habituales en vez de asumir un formato fijo).
const DATE_KEYS = ['date', 'fecha', 'time', 'datetime'];
const WEIGHT_KEYS = ['weight', 'peso', 'weight(kg)', 'weight_kg', 'kg'];
const FAT_KEYS = ['bodyfat', 'body fat', 'grasa', 'fat%', 'bodyfat%', 'grasa corporal', 'fat'];

export function parseFitdaysCsv(text) {
    const delimiter = text.includes(';') && !text.includes(',') ? ';' : ',';
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = splitCsvLine(lines[0], delimiter).map(h => h.trim().toLowerCase());
    const dateIdx = headers.findIndex(h => DATE_KEYS.includes(h));
    const weightIdx = headers.findIndex(h => WEIGHT_KEYS.includes(h));
    const fatIdx = headers.findIndex(h => FAT_KEYS.includes(h));

    if (dateIdx === -1 || weightIdx === -1) {
        throw new Error('No se reconocen las columnas de fecha/peso en el CSV.');
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = splitCsvLine(lines[i], delimiter);
        const rawDate = cols[dateIdx]?.trim();
        const rawWeight = cols[weightIdx]?.trim();
        if (!rawDate || !rawWeight) continue;

        const date = parseDate(rawDate);
        const weight = parseFloat(rawWeight.replace(',', '.'));
        if (!date || isNaN(weight)) continue;

        const bodyFatPct = fatIdx !== -1 && cols[fatIdx] ? parseFloat(cols[fatIdx].replace(',', '.')) : null;
        rows.push({ date: date.getTime(), weight, bodyFatPct: isNaN(bodyFatPct) ? null : bodyFatPct });
    }
    return rows;
}

function splitCsvLine(line, delimiter) {
    return line.split(delimiter).map(cell => cell.replace(/^"|"$/g, ''));
}

function parseDate(raw) {
    const iso = new Date(raw);
    if (!isNaN(iso.getTime())) return iso;
    const dmy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (dmy) {
        const [, d, m, y] = dmy;
        const year = y.length === 2 ? '20' + y : y;
        const parsed = new Date(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
        if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
}
