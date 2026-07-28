import { seedExercisesIfNeeded } from './workouts/exercises.js';
import { renderToday } from './today/todayView.js';
import { renderWorkoutTab } from './workouts/entrenoView.js';
import { renderWeight } from './weight/weightTracker.js';
import { renderRecipes } from './recipes/planner.js';

const TABS = {
    today: { title: 'Hoy', render: renderToday },
    workout: { title: 'Entreno', render: renderWorkoutTab },
    weight: { title: 'Peso', render: renderWeight },
    recipes: { title: 'Recetas', render: renderRecipes },
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

// Pide almacenamiento persistente para reducir el riesgo de que iOS/Safari
// borre los datos locales de la app bajo presión de memoria o espacio.
if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {});
}
