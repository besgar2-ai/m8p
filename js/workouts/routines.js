import { Store, uid } from '../storage.js';
import { getExercise } from './exercises.js';
import { openExercisePicker } from './exercisePicker.js';
import { openActiveWorkout } from './activeWorkout.js';

export function renderRoutines(root) {
    const templates = Store.templates;

    const wrap = document.createElement('div');

    if (templates.length === 0) {
        wrap.innerHTML = `
            <div class="empty-state">
                <span class="icon">🗒️</span>
                <p>Sin rutinas todavía.<br>Crea una para entrenar más rápido.</p>
            </div>
        `;
    } else {
        templates.forEach(t => {
            const names = t.exercises.map(te => getExercise(te.exerciseId)?.name).filter(Boolean).join(', ') || 'Sin ejercicios';
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                    <div>
                        <h3>${t.name}</h3>
                        <p class="hint">${names}</p>
                    </div>
                </div>
                <div class="btn-row" style="margin-top:10px">
                    <button class="btn" data-action="start">Iniciar</button>
                    <button class="btn secondary" data-action="edit">Editar</button>
                    <button class="btn secondary" data-action="delete">Eliminar</button>
                </div>
            `;
            card.querySelector('[data-action="start"]').addEventListener('click', () => startWorkout(t));
            card.querySelector('[data-action="edit"]').addEventListener('click', () => openTemplateEditor(t.id, () => renderRoutines(root)));
            card.querySelector('[data-action="delete"]').addEventListener('click', () => {
                if (confirm(`¿Eliminar la rutina "${t.name}"?`)) {
                    Store.templates = Store.templates.filter(x => x.id !== t.id);
                    renderRoutines(root);
                }
            });
            wrap.appendChild(card);
        });
    }

    const actions = document.createElement('div');
    actions.className = 'btn-row';
    actions.style.marginTop = '8px';
    actions.innerHTML = `
        <button class="btn block" id="newTemplateBtn">+ Nueva rutina</button>
        <button class="btn secondary block" id="emptyWorkoutBtn">Entreno vacío</button>
    `;
    wrap.appendChild(actions);

    root.innerHTML = '';
    root.appendChild(wrap);

    wrap.querySelector('#newTemplateBtn').addEventListener('click', () => {
        const newTemplate = { id: uid(), name: 'Nueva rutina', exercises: [] };
        Store.templates = [...Store.templates, newTemplate];
        openTemplateEditor(newTemplate.id, () => renderRoutines(root));
    });
    wrap.querySelector('#emptyWorkoutBtn').addEventListener('click', () => {
        if (!confirm('¿Iniciar un entrenamiento vacío?')) return;
        const workout = { id: uid(), name: 'Entreno libre', startedAt: Date.now(), endedAt: null, entries: [] };
        Store.workouts = [...Store.workouts, workout];
        openActiveWorkout(workout.id, () => renderRoutines(root));
    });
}

function startWorkout(template) {
    const workout = {
        id: uid(),
        name: template.name,
        startedAt: Date.now(),
        endedAt: null,
        entries: template.exercises.map(te => ({
            exerciseId: te.exerciseId,
            order: te.order,
            sets: Array.from({ length: te.targetSets }, (_, i) => ({ order: i, weight: 0, reps: 0, completed: false, isPR: false })),
        })),
    };
    Store.workouts = [...Store.workouts, workout];
    openActiveWorkout(workout.id, () => {
        renderRoutines(document.getElementById('workoutSubContent'));
    });
}

function openTemplateEditor(templateId, onClose) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    function render() {
        const template = Store.templates.find(t => t.id === templateId);
        const rows = template.exercises.map((te, idx) => {
            const ex = getExercise(te.exerciseId);
            return `
                <div class="list-item">
                    <span>${ex?.name ?? 'Ejercicio'}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="btn secondary" data-action="dec" data-idx="${idx}" style="padding:4px 10px">-</button>
                        <span>${te.targetSets} series</span>
                        <button class="btn secondary" data-action="inc" data-idx="${idx}" style="padding:4px 10px">+</button>
                        <button class="link-btn" data-action="remove" data-idx="${idx}">🗑️</button>
                    </div>
                </div>
            `;
        }).join('') || '<p class="hint">Añade ejercicios a esta rutina</p>';

        backdrop.innerHTML = `
            <div class="modal-sheet">
                <div class="modal-header">
                    <span></span>
                    <h2>Editar rutina</h2>
                    <button class="link-btn" data-action="done">Listo</button>
                </div>
                <div class="field">
                    <label>Nombre</label>
                    <input type="text" id="templateName" value="${escapeAttr(template.name)}" />
                </div>
                <h3>Ejercicios</h3>
                <div class="card" style="padding:0 14px">${rows}</div>
                <button class="btn secondary block" id="addExerciseBtn" style="margin-top:10px">+ Añadir ejercicio</button>
            </div>
        `;

        backdrop.querySelector('#templateName').addEventListener('input', e => {
            // Guarda directamente sin re-renderizar: si no, el input pierde el foco
            // y en móvil se cierra el teclado en cada tecla.
            const templates = Store.templates;
            const t = templates.find(x => x.id === templateId);
            t.name = e.target.value;
            Store.templates = templates;
        });
        backdrop.querySelectorAll('[data-action="inc"]').forEach(btn => btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            updateTemplate(t => { t.exercises[idx].targetSets = Math.min(10, t.exercises[idx].targetSets + 1); });
        }));
        backdrop.querySelectorAll('[data-action="dec"]').forEach(btn => btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            updateTemplate(t => { t.exercises[idx].targetSets = Math.max(1, t.exercises[idx].targetSets - 1); });
        }));
        backdrop.querySelectorAll('[data-action="remove"]').forEach(btn => btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            updateTemplate(t => { t.exercises.splice(idx, 1); });
        }));
        backdrop.querySelector('#addExerciseBtn').addEventListener('click', () => {
            openExercisePicker({
                onDone: chosen => {
                    updateTemplate(t => {
                        let nextOrder = t.exercises.length;
                        chosen.forEach(ex => {
                            t.exercises.push({ exerciseId: ex.id, order: nextOrder++, targetSets: 3 });
                        });
                    });
                },
            });
        });
        backdrop.querySelector('[data-action="done"]').addEventListener('click', () => {
            backdrop.remove();
            onClose();
        });
    }

    function updateTemplate(mutate) {
        const templates = Store.templates;
        const t = templates.find(x => x.id === templateId);
        mutate(t);
        Store.templates = templates;
        render();
    }

    render();
}

function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
}
