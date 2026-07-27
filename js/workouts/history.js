import { Store } from '../storage.js';
import { getExercise } from './exercises.js';

export function renderHistory(root) {
    const workouts = Store.workouts
        .filter(w => w.endedAt)
        .sort((a, b) => b.startedAt - a.startedAt);

    const wrap = document.createElement('div');

    if (workouts.length === 0) {
        wrap.innerHTML = `
            <div class="empty-state">
                <span class="icon">🕒</span>
                <p>Sin entrenamientos todavía.<br>Tus entrenos completados aparecerán aquí.</p>
            </div>
        `;
        root.innerHTML = '';
        root.appendChild(wrap);
        return;
    }

    workouts.forEach(w => {
        const totalSets = w.entries.reduce((sum, e) => sum + e.sets.filter(s => s.completed).length, 0);
        const totalVolume = w.entries.reduce((sum, e) => sum + e.sets.filter(s => s.completed).reduce((v, s) => v + s.weight * s.reps, 0), 0);
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <h3>${w.name}</h3>
            <p class="hint">${new Date(w.startedAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            <p class="hint">${totalSets} series · ${totalVolume.toFixed(0)} kg volumen</p>
        `;
        card.addEventListener('click', () => openWorkoutDetail(w));
        wrap.appendChild(card);
    });

    root.innerHTML = '';
    root.appendChild(wrap);
}

function openWorkoutDetail(workout) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    const duration = Math.floor(((workout.endedAt ?? Date.now()) - workout.startedAt) / 60000);

    backdrop.innerHTML = `
        <div class="modal-sheet">
            <div class="modal-header">
                <span></span>
                <h2>${workout.name}</h2>
                <button class="link-btn" data-action="close">Cerrar</button>
            </div>
            <div class="card">
                <div class="list-item"><span>Fecha</span><span>${new Date(workout.startedAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
                <div class="list-item"><span>Duración</span><span>${duration} min</span></div>
            </div>
            ${workout.entries.map(entry => `
                <h3>${getExercise(entry.exerciseId)?.name ?? 'Ejercicio'}</h3>
                <div class="card" style="padding:0 14px">
                    ${entry.sets.map((s, i) => `
                        <div class="list-item">
                            <span class="hint">Serie ${i + 1}</span>
                            <span>${s.weight} kg × ${s.reps} ${s.isPR ? '🏆' : ''}</span>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
            <button class="btn danger block" data-action="delete" style="margin:10px 0 24px">🗑️ Eliminar entrenamiento</button>
        </div>
    `;
    backdrop.addEventListener('click', e => {
        if (e.target === backdrop || e.target.dataset.action === 'close') backdrop.remove();
    });
    backdrop.querySelector('[data-action="delete"]').addEventListener('click', () => {
        if (!confirm('¿Eliminar este entrenamiento? No se puede deshacer.')) return;
        Store.workouts = Store.workouts.filter(w => w.id !== workout.id);
        backdrop.remove();
        renderHistory(document.getElementById('workoutSubContent'));
    });
    document.body.appendChild(backdrop);
}
