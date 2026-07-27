import { Store } from '../storage.js';
import { getExercise } from './exercises.js';
import { drawLineChart } from '../charts.js';

export function renderProgress(root) {
    const finishedWorkouts = Store.workouts.filter(w => w.endedAt);

    const byExercise = new Map();
    finishedWorkouts.forEach(w => {
        w.entries.forEach(entry => {
            const completed = entry.sets.filter(s => s.completed);
            if (completed.length === 0) return;
            const maxWeight = Math.max(...completed.map(s => s.weight));
            const list = byExercise.get(entry.exerciseId) ?? [];
            list.push({ date: w.startedAt, maxWeight });
            byExercise.set(entry.exerciseId, list);
        });
    });

    const wrap = document.createElement('div');

    if (byExercise.size === 0) {
        wrap.innerHTML = `
            <div class="empty-state">
                <span class="icon">📈</span>
                <p>Sin progreso todavía.<br>Completa entrenamientos para ver tu evolución.</p>
            </div>
        `;
        root.innerHTML = '';
        root.appendChild(wrap);
        return;
    }

    root.innerHTML = '';
    root.appendChild(wrap);

    [...byExercise.entries()]
        .sort(([a], [b]) => (getExercise(a)?.name ?? '').localeCompare(getExercise(b)?.name ?? ''))
        .forEach(([exerciseId, points]) => {
            const sorted = points.sort((a, b) => a.date - b.date);
            const pr = Math.max(...sorted.map(p => p.maxWeight));
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3>${getExercise(exerciseId)?.name ?? 'Ejercicio'}</h3>
                    <span class="badge gold">PR ${pr} kg</span>
                </div>
                <div class="chart-wrap"><canvas></canvas></div>
            `;
            wrap.appendChild(card);
            const canvas = card.querySelector('canvas');
            requestAnimationFrame(() => {
                drawLineChart(canvas, sorted.map(p => ({ value: p.maxWeight })));
            });
        });
}
