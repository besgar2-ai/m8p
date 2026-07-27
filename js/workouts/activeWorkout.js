import { Store } from '../storage.js';
import { getExercise } from './exercises.js';
import { openExercisePicker } from './exercisePicker.js';

let restInterval = null;

export function openActiveWorkout(workoutId, onClose) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.style.alignItems = 'stretch';
    document.body.appendChild(overlay);

    let restSecondsLeft = 0;
    let elapsedInterval = null;

    function getWorkout() {
        return Store.workouts.find(w => w.id === workoutId);
    }
    function updateWorkout(mutate) {
        const workouts = Store.workouts;
        const w = workouts.find(x => x.id === workoutId);
        mutate(w);
        Store.workouts = workouts;
        render();
    }

    function startRest(seconds) {
        restSecondsLeft = seconds;
        clearInterval(restInterval);
        restInterval = setInterval(() => {
            restSecondsLeft = Math.max(0, restSecondsLeft - 1);
            updateRestUI();
            if (restSecondsLeft === 0) clearInterval(restInterval);
        }, 1000);
        render();
    }

    function stopRest() {
        clearInterval(restInterval);
        restSecondsLeft = 0;
        render();
    }

    function updateRestUI() {
        const el = overlay.querySelector('#restTime');
        if (el) el.textContent = formatTime(restSecondsLeft);
    }

    function isPersonalRecord(exerciseId, weight, excludingSetsFromThisWorkout) {
        if (weight <= 0) return false;
        const prevMax = Store.workouts
            .filter(w => w.id !== workoutId && w.endedAt)
            .flatMap(w => w.entries.filter(en => en.exerciseId === exerciseId))
            .flatMap(en => en.sets.filter(s => s.completed))
            .reduce((max, s) => Math.max(max, s.weight), 0);
        return weight > prevMax;
    }

    function render() {
        const workout = getWorkout();
        const elapsed = Math.floor(((workout.endedAt ?? Date.now()) - workout.startedAt) / 1000);

        overlay.innerHTML = `
            <div class="modal-sheet" style="height:100%; border-radius:0; max-height:100%;">
                <div class="modal-header">
                    <button class="link-btn" data-action="cancel" style="color:var(--danger)">Cancelar</button>
                    <span style="font-variant-numeric:tabular-nums; color:var(--text-secondary); font-size:13px">${formatTime(elapsed)}</span>
                    <button class="link-btn" data-action="finish">Terminar</button>
                </div>
                <h2 style="margin-top:0">${workout.name}</h2>
                ${restSecondsLeft > 0 ? `
                    <div class="rest-timer">
                        <span>⏱ Descanso: <span id="restTime">${formatTime(restSecondsLeft)}</span></span>
                        <span class="btn-row">
                            <button class="btn secondary" data-action="add-rest" style="padding:6px 10px">+15s</button>
                            <button class="btn secondary" data-action="stop-rest" style="padding:6px 10px">Saltar</button>
                        </span>
                    </div>
                ` : ''}
                ${workout.entries.map((entry, entryIdx) => exerciseCard(entry, entryIdx)).join('')}
                <button class="btn secondary block" id="addExerciseBtn" style="margin:10px 0 24px">+ Añadir ejercicio</button>
            </div>
        `;

        overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
            if (!confirm('¿Descartar este entrenamiento?')) return;
            clearInterval(restInterval);
            clearInterval(elapsedInterval);
            Store.workouts = Store.workouts.filter(w => w.id !== workoutId);
            overlay.remove();
            onClose();
        });
        overlay.querySelector('[data-action="finish"]').addEventListener('click', () => {
            if (!confirm('¿Terminar entrenamiento?')) return;
            updateWorkout(w => {
                w.entries.forEach(en => { en.sets = en.sets.filter(s => s.completed); });
                w.entries = w.entries.filter(en => en.sets.length > 0);
                w.endedAt = Date.now();
            });
            clearInterval(restInterval);
            clearInterval(elapsedInterval);
            overlay.remove();
            onClose();
        });
        overlay.querySelector('#addExerciseBtn').addEventListener('click', () => {
            openExercisePicker({
                onDone: chosen => {
                    updateWorkout(w => {
                        let nextOrder = w.entries.length;
                        chosen.forEach(ex => {
                            w.entries.push({ exerciseId: ex.id, order: nextOrder++, sets: [{ order: 0, weight: 0, reps: 0, completed: false, isPR: false }] });
                        });
                    });
                },
            });
        });
        const addRestBtn = overlay.querySelector('[data-action="add-rest"]');
        if (addRestBtn) addRestBtn.addEventListener('click', () => { restSecondsLeft += 15; updateRestUI(); });
        const stopRestBtn = overlay.querySelector('[data-action="stop-rest"]');
        if (stopRestBtn) stopRestBtn.addEventListener('click', stopRest);

        overlay.querySelectorAll('[data-add-set]').forEach(btn => btn.addEventListener('click', () => {
            const entryIdx = Number(btn.dataset.addSet);
            updateWorkout(w => {
                const entry = w.entries[entryIdx];
                entry.sets.push({ order: entry.sets.length, weight: 0, reps: 0, completed: false, isPR: false });
            });
        }));

        overlay.querySelectorAll('[data-weight]').forEach(input => input.addEventListener('input', e => {
            const [entryIdx, setIdx] = e.target.dataset.weight.split('-').map(Number);
            const workouts = Store.workouts;
            const w = workouts.find(x => x.id === workoutId);
            w.entries[entryIdx].sets[setIdx].weight = parseFloat(e.target.value) || 0;
            Store.workouts = workouts;
        }));
        overlay.querySelectorAll('[data-reps]').forEach(input => input.addEventListener('input', e => {
            const [entryIdx, setIdx] = e.target.dataset.reps.split('-').map(Number);
            const workouts = Store.workouts;
            const w = workouts.find(x => x.id === workoutId);
            w.entries[entryIdx].sets[setIdx].reps = parseInt(e.target.value) || 0;
            Store.workouts = workouts;
        }));
        overlay.querySelectorAll('[data-check]').forEach(btn => btn.addEventListener('click', () => {
            const [entryIdx, setIdx] = btn.dataset.check.split('-').map(Number);
            updateWorkout(w => {
                const entry = w.entries[entryIdx];
                const set = entry.sets[setIdx];
                set.completed = !set.completed;
                if (set.completed) {
                    set.isPR = isPersonalRecord(entry.exerciseId, set.weight);
                    startRest(90);
                } else {
                    set.isPR = false;
                }
            });
        }));
    }

    function exerciseCard(entry, entryIdx) {
        const ex = getExercise(entry.exerciseId);
        const rows = entry.sets.map((set, setIdx) => `
            <div class="set-row">
                <span class="hint">Serie ${setIdx + 1}</span>
                <input type="number" inputmode="decimal" placeholder="kg" value="${set.weight || ''}" data-weight="${entryIdx}-${setIdx}" />
                <span class="x">×</span>
                <input type="number" inputmode="numeric" placeholder="reps" value="${set.reps || ''}" data-reps="${entryIdx}-${setIdx}" />
                <button class="check-btn ${set.completed ? 'done' : ''}" data-check="${entryIdx}-${setIdx}">${set.isPR ? '🏆' : '✓'}</button>
            </div>
        `).join('');
        return `
            <div class="card">
                <h3>${ex?.name ?? 'Ejercicio'}</h3>
                ${entry.prescriptionNote ? `<p class="hint">${entry.prescriptionNote}</p>` : ''}
                ${rows}
                <button class="link-btn" data-add-set="${entryIdx}" style="margin-top:4px">+ Añadir serie</button>
            </div>
        `;
    }

    elapsedInterval = setInterval(() => {
        const workout = getWorkout();
        if (!workout || workout.endedAt) return;
        const el = overlay.querySelector('.modal-header span');
        if (el) el.textContent = formatTime(Math.floor((Date.now() - workout.startedAt) / 1000));
    }, 1000);

    render();
}

function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}
