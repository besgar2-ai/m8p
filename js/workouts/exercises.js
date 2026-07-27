import { Store, uid } from '../storage.js';

export const DEFAULT_EXERCISES = [
    ['Press de banca', 'Pecho'],
    ['Press inclinado con mancuernas', 'Pecho'],
    ['Aperturas con mancuernas', 'Pecho'],
    ['Fondos en paralelas', 'Pecho'],
    ['Dominadas', 'Espalda'],
    ['Remo con barra', 'Espalda'],
    ['Jalón al pecho', 'Espalda'],
    ['Remo con mancuerna', 'Espalda'],
    ['Peso muerto', 'Espalda'],
    ['Sentadilla', 'Piernas'],
    ['Prensa de piernas', 'Piernas'],
    ['Zancadas', 'Piernas'],
    ['Curl femoral', 'Piernas'],
    ['Extensión de cuádriceps', 'Piernas'],
    ['Elevación de talones', 'Piernas'],
    ['Press militar', 'Hombro'],
    ['Elevaciones laterales', 'Hombro'],
    ['Pájaros (elevación posterior)', 'Hombro'],
    ['Curl de bíceps con barra', 'Brazo'],
    ['Curl martillo', 'Brazo'],
    ['Press francés', 'Brazo'],
    ['Extensión de tríceps en polea', 'Brazo'],
    ['Plancha', 'Core'],
    ['Elevación de piernas colgado', 'Core'],
    ['Crunch abdominal', 'Core'],
    ['Carrera', 'Cardio'],
    ['Bicicleta estática', 'Cardio'],
];

export function seedExercisesIfNeeded() {
    if (Store.exercises.length > 0) return;
    Store.exercises = DEFAULT_EXERCISES.map(([name, muscleGroup]) => ({
        id: uid(), name, muscleGroup,
    }));
}

export function getExercise(id) {
    return Store.exercises.find(e => e.id === id);
}
