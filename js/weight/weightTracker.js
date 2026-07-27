import { Store, uid } from '../storage.js';
import { drawLineChart } from '../charts.js';
import { parseFitdaysCsv } from './csvImport.js';

export function renderWeight(root) {
    const entries = [...Store.weightEntries].sort((a, b) => a.date - b.date);
    const profile = Store.profile ?? {};

    const wrap = document.createElement('div');

    const goalCard = document.createElement('div');
    goalCard.className = 'card';
    const current = entries.at(-1);
    const goalWeight = profile.goalWeightKg;
    goalCard.innerHTML = `
        <div class="list-item">
            <span>Peso actual</span>
            <strong>${current ? current.weight + ' kg' : '—'}</strong>
        </div>
        <div class="list-item">
            <span>Objetivo</span>
            <span>
                <input type="number" id="goalWeightInput" placeholder="kg" value="${goalWeight ?? ''}" style="width:80px; display:inline-block" />
            </span>
        </div>
        ${current && goalWeight ? `<p class="hint">${(current.weight - goalWeight).toFixed(1)} kg para llegar al objetivo</p>` : ''}
    `;
    wrap.appendChild(goalCard);
    goalCard.querySelector('#goalWeightInput').addEventListener('change', e => {
        Store.profile = { ...Store.profile, goalWeightKg: parseFloat(e.target.value) || null };
        renderWeight(root);
    });

    if (entries.length > 1) {
        const chartCard = document.createElement('div');
        chartCard.className = 'card';
        chartCard.innerHTML = `<h3>Tendencia</h3><div class="chart-wrap"><canvas></canvas></div>`;
        wrap.appendChild(chartCard);
        requestAnimationFrame(() => {
            drawLineChart(chartCard.querySelector('canvas'), entries.map(e => ({ value: e.weight })), { color: '#ff3782' });
        });
    }

    const addCard = document.createElement('div');
    addCard.className = 'card';
    addCard.innerHTML = `
        <h3>Registrar pesaje</h3>
        <div class="field">
            <label>Fecha</label>
            <input type="date" id="weightDate" value="${new Date().toISOString().slice(0, 10)}" />
        </div>
        <div class="field">
            <label>Peso (kg)</label>
            <input type="number" step="0.1" id="weightValue" placeholder="ej. 68.4" />
        </div>
        <div class="field">
            <label>% Grasa corporal (opcional)</label>
            <input type="number" step="0.1" id="bodyFatValue" placeholder="ej. 24.5" />
        </div>
        <button class="btn block" id="saveWeightBtn">Guardar</button>
    `;
    wrap.appendChild(addCard);
    addCard.querySelector('#saveWeightBtn').addEventListener('click', () => {
        const dateStr = addCard.querySelector('#weightDate').value;
        const weight = parseFloat(addCard.querySelector('#weightValue').value);
        const bodyFat = parseFloat(addCard.querySelector('#bodyFatValue').value);
        if (!dateStr || !weight) { alert('Introduce al menos fecha y peso.'); return; }
        const date = new Date(dateStr).getTime();
        const newEntry = { id: uid(), date, weight, bodyFatPct: isNaN(bodyFat) ? null : bodyFat };
        const withoutSameDay = Store.weightEntries.filter(e => new Date(e.date).toDateString() !== new Date(date).toDateString());
        Store.weightEntries = [...withoutSameDay, newEntry];
        renderWeight(root);
    });

    const importCard = document.createElement('div');
    importCard.className = 'card';
    importCard.innerHTML = `
        <h3>Importar desde FitDays</h3>
        <p class="hint">FitDays no ofrece conexión automática. Exporta tu historial como CSV desde su app (Perfil → Exportar datos) y súbelo aquí.</p>
        <input type="file" accept=".csv" id="csvInput" />
        <p class="hint" id="importStatus"></p>
    `;
    wrap.appendChild(importCard);
    importCard.querySelector('#csvInput').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        const status = importCard.querySelector('#importStatus');
        try {
            const parsed = parseFitdaysCsv(text);
            if (parsed.length === 0) {
                status.textContent = 'No se encontraron filas de peso reconocibles en el CSV.';
                return;
            }
            const existingDates = new Set(Store.weightEntries.map(e => new Date(e.date).toDateString()));
            const newOnes = parsed.filter(p => !existingDates.has(new Date(p.date).toDateString()))
                .map(p => ({ id: uid(), ...p }));
            Store.weightEntries = [...Store.weightEntries, ...newOnes];
            status.textContent = `Importados ${newOnes.length} registros nuevos.`;
            renderWeight(root);
        } catch (err) {
            status.textContent = 'No se pudo leer el archivo: ' + err.message;
        }
    });

    if (entries.length > 0) {
        const historyCard = document.createElement('div');
        historyCard.className = 'card';
        historyCard.innerHTML = `
            <h3>Historial</h3>
            ${[...entries].reverse().map(e => `
                <div class="list-item">
                    <span>${new Date(e.date).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</span>
                    <span>${e.weight} kg ${e.bodyFatPct ? `· ${e.bodyFatPct}% grasa` : ''}</span>
                </div>
            `).join('')}
        `;
        wrap.appendChild(historyCard);
    }

    root.innerHTML = '';
    root.appendChild(wrap);
}
