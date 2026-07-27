import { renderRoutines } from './routines.js';
import { renderHistory } from './history.js';
import { renderProgress } from './progress.js';
import { renderProgram } from '../program/programView.js';

const SUBTABS = [
    { id: 'routines', label: 'Rutinas', render: renderRoutines },
    { id: 'program', label: 'Programa', render: renderProgram },
    { id: 'history', label: 'Historial', render: renderHistory },
    { id: 'progress', label: 'Progreso', render: renderProgress },
];

let activeSubTab = 'routines';

export function setWorkoutSubTab(id) {
    if (SUBTABS.some(t => t.id === id)) activeSubTab = id;
}

export function renderWorkoutTab(root) {
    root.innerHTML = `
        <div class="segmented">
            ${SUBTABS.map(t => `
                <button class="segmented-btn ${t.id === activeSubTab ? 'active' : ''}" data-sub="${t.id}">${t.label}</button>
            `).join('')}
        </div>
        <div id="workoutSubContent"></div>
    `;

    root.querySelectorAll('[data-sub]').forEach(btn => {
        btn.addEventListener('click', () => {
            activeSubTab = btn.dataset.sub;
            renderWorkoutTab(root);
        });
    });

    const sub = SUBTABS.find(t => t.id === activeSubTab);
    sub.render(root.querySelector('#workoutSubContent'));
}
