import { Store } from '../storage.js';
import { getRecipe } from '../recipes/recipeData.js';
import { setWorkoutSubTab } from '../workouts/entrenoView.js';

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function switchTab(tabId) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.click();
}

function weightCard() {
    const entries = [...Store.weightEntries].sort((a, b) => a.date - b.date);
    const last = entries.at(-1);
    const prev = entries.at(-2);
    const card = document.createElement('div');
    card.className = 'card';

    if (!last) {
        card.innerHTML = `
            <h3>Peso</h3>
            <p class="hint">Aún no has registrado ningún peso.</p>
            <button class="btn secondary block" id="goWeightBtn" style="margin-top:8px">Registrar peso</button>
        `;
    } else {
        const delta = prev ? last.weight - prev.weight : null;
        card.innerHTML = `
            <h3>Peso</h3>
            <div class="list-item">
                <span>Último registro</span>
                <strong>${last.weight} kg</strong>
            </div>
            <p class="hint">${new Date(last.date).toLocaleDateString('es-ES', { dateStyle: 'medium' })}${delta !== null && !isNaN(delta) ? ` · ${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg desde el registro anterior` : ''}</p>
        `;
    }

    card.querySelector('#goWeightBtn')?.addEventListener('click', () => switchTab('weight'));
    return card;
}

function workoutCard() {
    const todayStr = new Date().toDateString();
    const todaysWorkouts = Store.workouts.filter(w => new Date(w.startedAt).toDateString() === todayStr);
    const card = document.createElement('div');
    card.className = 'card';

    if (todaysWorkouts.length === 0) {
        card.innerHTML = `
            <h3>Entreno de hoy</h3>
            <p class="hint">Todavía no has entrenado hoy.</p>
            <div class="btn-row" style="margin-top:8px">
                <button class="btn" id="startWorkoutBtn">Ver rutinas</button>
                <button class="btn secondary" id="goProgramBtn">Ver programa</button>
            </div>
        `;
    } else {
        const finished = todaysWorkouts.filter(w => w.endedAt);
        const w = finished.at(-1) ?? todaysWorkouts.at(-1);
        const totalSets = (w.entries ?? []).reduce((sum, e) => sum + (e.sets?.filter(s => s.completed).length ?? 0), 0);
        const totalVolume = (w.entries ?? []).reduce((sum, e) => sum + (e.sets?.filter(s => s.completed).reduce((v, s) => v + s.weight * s.reps, 0) ?? 0), 0);
        card.innerHTML = `
            <h3>Entreno de hoy</h3>
            <div class="list-item">
                <span>${w.name}</span>
                <span class="badge ${w.endedAt ? '' : 'gold'}">${w.endedAt ? 'Completado' : 'En curso'}</span>
            </div>
            <p class="hint">${totalSets} series · ${totalVolume.toFixed(0)} kg volumen</p>
        `;
    }

    card.querySelector('#startWorkoutBtn')?.addEventListener('click', () => {
        setWorkoutSubTab('routines');
        switchTab('workout');
    });
    card.querySelector('#goProgramBtn')?.addEventListener('click', () => {
        setWorkoutSubTab('program');
        switchTab('workout');
    });
    return card;
}

function mealsCard() {
    const dayIdx = (new Date().getDay() + 6) % 7;
    const plan = Store.weeklyPlan;
    const card = document.createElement('div');
    card.className = 'card';

    const day = plan?.days?.[dayIdx];
    if (!day) {
        card.innerHTML = `
            <h3>Comidas de hoy</h3>
            <p class="hint">Aún no tienes un plan semanal generado.</p>
            <button class="btn secondary block" id="goRecipesBtn" style="margin-top:8px">Configurar recetas</button>
        `;
    } else {
        const total = day.meals.reduce((sum, m) => sum + (getRecipe(m.recipeId)?.calories ?? 0), 0);
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Comidas de hoy · ${DAY_LABELS[dayIdx]}</h3>
                <span class="badge">${total} kcal</span>
            </div>
            ${day.meals.map(m => {
                const r = getRecipe(m.recipeId);
                if (!r) return '';
                return `<div class="meal-row"><span>${r.mealType}: ${r.name}</span><span class="meta">${r.calories} kcal</span></div>`;
            }).join('')}
        `;
    }

    card.querySelector('#goRecipesBtn')?.addEventListener('click', () => switchTab('recipes'));
    return card;
}

export function renderToday(root) {
    const wrap = document.createElement('div');
    wrap.appendChild(weightCard());
    wrap.appendChild(workoutCard());
    wrap.appendChild(mealsCard());
    root.innerHTML = '';
    root.appendChild(wrap);
}
