import { Store } from '../storage.js';

export function openExercisePicker({ onDone }) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    const selected = new Set();

    function groupedHtml(filter = '') {
        const exercises = Store.exercises.filter(e =>
            e.name.toLowerCase().includes(filter.toLowerCase())
        );
        const groups = {};
        exercises.forEach(e => {
            (groups[e.muscleGroup] ??= []).push(e);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([group, items]) => `
            <h3>${group}</h3>
            <div class="card" style="padding:0 14px">
                ${items.map(e => `
                    <div class="list-item" data-id="${e.id}" style="cursor:pointer">
                        <span>${e.name}</span>
                        <span class="check-mark">${selected.has(e.id) ? '✅' : ''}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    backdrop.innerHTML = `
        <div class="modal-sheet">
            <div class="modal-header">
                <button class="link-btn" data-action="cancel">Cancelar</button>
                <h2>Ejercicios</h2>
                <button class="link-btn" data-action="done">Añadir</button>
            </div>
            <input type="search" placeholder="Buscar ejercicio" id="exerciseSearch" style="margin-bottom:12px" />
            <div id="exerciseList">${groupedHtml()}</div>
        </div>
    `;
    document.body.appendChild(backdrop);

    const list = backdrop.querySelector('#exerciseList');
    backdrop.querySelector('#exerciseSearch').addEventListener('input', e => {
        list.innerHTML = groupedHtml(e.target.value);
    });

    list.addEventListener('click', e => {
        const row = e.target.closest('.list-item');
        if (!row) return;
        const id = row.dataset.id;
        if (selected.has(id)) selected.delete(id); else selected.add(id);
        row.querySelector('.check-mark').textContent = selected.has(id) ? '✅' : '';
    });

    backdrop.addEventListener('click', e => {
        if (e.target === backdrop) close();
        const action = e.target.dataset.action;
        if (action === 'cancel') close();
        if (action === 'done') {
            const chosen = Store.exercises.filter(ex => selected.has(ex.id));
            close();
            onDone(chosen);
        }
    });

    function close() {
        backdrop.remove();
    }
}
