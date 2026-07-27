import { Store } from '../storage.js';

// Split Torso/Pierna x2 (4 días/semana), pensado para pérdida de grasa
// con mantenimiento de masa muscular en gimnasio completo, nivel intermedio.
export const TRAINING_DAYS = [
    {
        key: 'upperA',
        label: 'Torso A · empuje/tirón horizontal',
        exercises: [
            { name: 'Press de banca', tier: 'compound' },
            { name: 'Remo con barra', tier: 'compound' },
            { name: 'Jalón al pecho', tier: 'accessory' },
            { name: 'Elevaciones laterales', tier: 'accessory' },
            { name: 'Curl de bíceps con barra', tier: 'accessory' },
            { name: 'Extensión de tríceps en polea', tier: 'accessory' },
        ],
    },
    {
        key: 'lowerA',
        label: 'Pierna A · dominante rodilla',
        exercises: [
            { name: 'Sentadilla', tier: 'compound' },
            { name: 'Prensa de piernas', tier: 'accessory' },
            { name: 'Curl femoral', tier: 'accessory' },
            { name: 'Elevación de talones', tier: 'accessory' },
            { name: 'Plancha', tier: 'core' },
        ],
    },
    {
        key: 'upperB',
        label: 'Torso B · empuje/tirón vertical',
        exercises: [
            { name: 'Press militar', tier: 'compound' },
            { name: 'Dominadas', tier: 'compound' },
            { name: 'Press inclinado con mancuernas', tier: 'accessory' },
            { name: 'Remo con mancuerna', tier: 'accessory' },
            { name: 'Pájaros (elevación posterior)', tier: 'accessory' },
            { name: 'Curl martillo', tier: 'accessory' },
            { name: 'Press francés', tier: 'accessory' },
        ],
    },
    {
        key: 'lowerB',
        label: 'Pierna B · dominante cadera',
        exercises: [
            { name: 'Peso muerto', tier: 'compound' },
            { name: 'Zancadas', tier: 'accessory' },
            { name: 'Extensión de cuádriceps', tier: 'accessory' },
            { name: 'Elevación de talones', tier: 'accessory' },
            { name: 'Elevación de piernas colgado', tier: 'core' },
        ],
    },
];

// Índice = semana (0 = semana 1 ... 3 = semana 4, descarga)
const SCHEME = {
    compound: [
        { sets: 3, reps: '10-12', rpe: 7 },
        { sets: 3, reps: '8-10', rpe: 7.5 },
        { sets: 4, reps: '6-8', rpe: 8.5 },
        { sets: 2, reps: '10', rpe: 5, label: 'Descarga' },
    ],
    accessory: [
        { sets: 3, reps: '12-15', rpe: 7 },
        { sets: 3, reps: '12-15', rpe: 7.5 },
        { sets: 3, reps: '10-12', rpe: 8 },
        { sets: 2, reps: '15', rpe: 5, label: 'Descarga' },
    ],
    core: [
        { sets: 3, reps: '30-45s', rpe: 7 },
        { sets: 3, reps: '30-45s', rpe: 7.5 },
        { sets: 3, reps: '45-60s', rpe: 8 },
        { sets: 2, reps: '30s', rpe: 5, label: 'Descarga' },
    ],
};

export const WEEK_LABELS = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4 (descarga)'];

export function getPrescription(tier, weekIndex) {
    return SCHEME[tier][weekIndex];
}

export function prescriptionText(tier, weekIndex) {
    const p = getPrescription(tier, weekIndex);
    return `${p.sets}×${p.reps} @ RPE ${p.rpe}${p.label ? ` · ${p.label}` : ''}`;
}

function resolveExerciseId(name) {
    return Store.exercises.find(e => e.name === name)?.id ?? null;
}

export function resolvedDays() {
    return TRAINING_DAYS.map(day => ({
        ...day,
        exercises: day.exercises
            .map(ex => ({ ...ex, exerciseId: resolveExerciseId(ex.name) }))
            .filter(ex => ex.exerciseId),
    }));
}
