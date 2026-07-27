import { seedExercisesIfNeeded } from './workouts/exercises.js';
import { renderToday } from './today/todayView.js';
import { renderRoutines } from './workouts/routines.js';
import { renderHistory } from './workouts/history.js';
import { renderProgress } from './workouts/progress.js';
import { renderWeight } from './weight/weightTracker.js';
import { renderRecipes } from './recipes/planner.js';
import { renderProgram } from './program/programView.js';

const TABS = {
    today: { title: 'Hoy', render: renderToday },
    routines: { title: 'Rutinas', render: renderRoutines },
    history: { title: 'Historial', render: renderHistory },
    progress: { title: 'Progreso', render: renderProgress },
    weight: { title: 'Peso', render: renderWeight },
    recipes: { title: 'Recetas', render: renderRecipes },
    program: { title: 'Programa', render: renderProgram },
};

const app = document.getElementById('app');
const pageTitle = document.getElementById('pageTitle');

export function navigate(tabId) {
    const tab = TABS[tabId];
    if (!tab) return;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    pageTitle.textContent = tab.title;
    app.innerHTML = '';
    tab.render(app);
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.tab));
});

seedExercisesIfNeeded();
navigate('today');
