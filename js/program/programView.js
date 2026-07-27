import { Store, uid } from '../storage.js';
import { resolvedDays, WEEK_LABELS, getPrescription, prescriptionText } from './trainingProgram.js';
import { openActiveWorkout } from '../workouts/activeWorkout.js';

export function renderProgram(root) {
    const wrap = document.createElement('div');

    const days = resolvedDays();
    if (days.every(d => d.exercises.length === 0)) {
        wrap.innerHTML = `
            <div class="empty-state">
                <span class="icon">📅</span>
                <p>No se pudo generar el programa: faltan ejercicios del catálogo.</p>
            </div>
        `;
        root.innerHTML = '';
        root.appendChild(wrap);
        return;
    }

    const summary = document.createElement('div');
    summary.className = 'card';
    summary.innerHTML = `
        <h3>Programa mensual</h3>
        <p class="hint">Pérdida de grasa + mantenimiento muscular · 4 días/semana · Gimnasio completo · Nivel intermedio</p>
        <p class="hint">Split Torso/Pierna x2 con progresión de carga durante 3 semanas y una semana de descarga.</p>
    `;
    wrap.appendChild(summary);

    WEEK_LABELS.forEach((weekLabel, weekIndex) => {
        const weekHeading = document.createElement('h2');
        weekHeading.textContent = weekLabel;
        wrap.appendChild(weekHeading);

        days.forEach(day => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>${day.label}</h3>
                    <button class="btn secondary" data-start style="padding:6px 12px">Iniciar</button>
                </div>
                ${day.exercises.map(ex => `
                    <div class="list-item">
                        <span>${ex.name}</span>
                        <span class="meta" style="color:var(--text-secondary); font-size:12px; text-align:right">${prescriptionText(ex.tier, weekIndex)}</span>
                    </div>
                `).join('')}
            `;
            card.querySelector('[data-start]').addEventListener('click', () => {
                startProgramDay(day, weekIndex);
            });
            wrap.appendChild(card);
        });
    });

    root.innerHTML = '';
    root.appendChild(wrap);
}

function getLastWeight(exerciseId) {
    const finished = Store.workouts
        .filter(w => w.endedAt)
        .sort((a, b) => b.startedAt - a.startedAt);
    for (const w of finished) {
        for (const entry of w.entries) {
            if (entry.exerciseId !== exerciseId) continue;
            const completed = entry.sets.filter(s => s.completed && s.weight > 0);
            if (completed.length > 0) return Math.max(...completed.map(s => s.weight));
        }
    }
    return null;
}

function startProgramDay(day, weekIndex) {
    const workout = {
        id: uid(),
        name: day.label,
        startedAt: Date.now(),
        endedAt: null,
        entries: day.exercises.map((ex, order) => {
            const prescription = getPrescription(ex.tier, weekIndex);
            const lastWeight = getLastWeight(ex.exerciseId);
            const note = `Objetivo: ${prescriptionText(ex.tier, weekIndex)}` + (lastWeight ? ` · Última vez: ${lastWeight} kg` : '');
            return {
                exerciseId: ex.exerciseId,
                order,
                prescriptionNote: note,
                sets: Array.from({ length: prescription.sets }, (_, i) => ({ order: i, weight: 0, reps: 0, completed: false, isPR: false })),
            };
        }),
    };
    Store.workouts = [...Store.workouts, workout];
    openActiveWorkout(workout.id, () => {
        renderProgram(document.getElementById('workoutSubContent'));
    });
}
