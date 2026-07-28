import { Store, uid } from '../storage.js';
import { drawLineChart } from '../charts.js';
import { parseFitdaysCsv } from './csvImport.js';
import { compressImageFile } from '../recipes/imageUtils.js';

export function renderWeight(root) {
    const entries = [...Store.weightEntries].sort((a, b) => a.date - b.date);
    const profile = Store.profile ?? {};
    let pendingPhoto = null;

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

    const photoEntries = entries.filter(e => e.photo);
    if (photoEntries.length > 0) {
        const galleryCard = document.createElement('div');
        galleryCard.className = 'card';
        galleryCard.innerHTML = `
            <h3>Fotos de progreso</h3>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
                ${photoEntries.map(e => `
                    <div data-photo="${e.id}" style="cursor:pointer">
                        <img src="${e.photo}" alt="" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:10px; display:block;" />
                        <p class="hint" style="margin:4px 0 0; text-align:center; font-size:11px;">${new Date(e.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                    </div>
                `).join('')}
            </div>
        `;
        wrap.appendChild(galleryCard);
        galleryCard.querySelectorAll('[data-photo]').forEach(el => {
            el.addEventListener('click', () => {
                const entry = entries.find(e => e.id === el.dataset.photo);
                openPhotoDetail(entry);
            });
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
        <div class="field">
            <label>Foto de progreso (opcional)</label>
            <div id="weightPhotoSection"></div>
        </div>
        <button class="btn block" id="saveWeightBtn">Guardar</button>
    `;
    wrap.appendChild(addCard);

    function renderPhotoSection() {
        const section = addCard.querySelector('#weightPhotoSection');
        if (pendingPhoto) {
            section.innerHTML = `
                <img src="${pendingPhoto}" alt="" style="width:100%; max-height:220px; object-fit:cover; border-radius:12px; display:block; margin-bottom:8px;" />
                <button class="link-btn" id="removeWeightPhotoBtn" style="color:var(--danger)">Quitar foto</button>
            `;
            section.querySelector('#removeWeightPhotoBtn').addEventListener('click', () => {
                pendingPhoto = null;
                renderPhotoSection();
            });
        } else {
            section.innerHTML = `<input type="file" accept="image/*" id="weightPhotoInput" />`;
            section.querySelector('#weightPhotoInput').addEventListener('change', async e => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    pendingPhoto = await compressImageFile(file);
                    renderPhotoSection();
                } catch {
                    alert('No se pudo procesar la imagen.');
                }
            });
        }
    }
    renderPhotoSection();

    addCard.querySelector('#saveWeightBtn').addEventListener('click', () => {
        const dateStr = addCard.querySelector('#weightDate').value;
        const weight = parseFloat(addCard.querySelector('#weightValue').value);
        const bodyFat = parseFloat(addCard.querySelector('#bodyFatValue').value);
        if (!dateStr || !weight) { alert('Introduce al menos fecha y peso.'); return; }
        const date = new Date(dateStr).getTime();
        const newEntry = { id: uid(), date, weight, bodyFatPct: isNaN(bodyFat) ? null : bodyFat, photo: pendingPhoto };
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
                <div class="list-item" ${e.photo ? `data-photo="${e.id}" style="cursor:pointer"` : ''}>
                    <span style="display:flex; align-items:center; gap:8px;">
                        ${e.photo ? `<img src="${e.photo}" alt="" style="width:32px; height:32px; object-fit:cover; border-radius:8px;" />` : ''}
                        ${new Date(e.date).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                    </span>
                    <span>${e.weight} kg ${e.bodyFatPct ? `· ${e.bodyFatPct}% grasa` : ''}</span>
                </div>
            `).join('')}
        `;
        wrap.appendChild(historyCard);
        historyCard.querySelectorAll('[data-photo]').forEach(el => {
            el.addEventListener('click', () => {
                const entry = entries.find(e => e.id === el.dataset.photo);
                openPhotoDetail(entry);
            });
        });
    }

    root.innerHTML = '';
    root.appendChild(wrap);
}

function openPhotoDetail(entry) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal-sheet">
            <div class="modal-header">
                <span></span>
                <h2>${new Date(entry.date).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</h2>
                <button class="link-btn" data-action="close">Cerrar</button>
            </div>
            <img src="${entry.photo}" alt="" style="width:100%; border-radius:14px; display:block; margin-bottom:12px;" />
            <div class="card">
                <div class="list-item"><span>Peso</span><strong>${entry.weight} kg</strong></div>
                ${entry.bodyFatPct ? `<div class="list-item"><span>Grasa corporal</span><span>${entry.bodyFatPct}%</span></div>` : ''}
            </div>
        </div>
    `;
    backdrop.addEventListener('click', e => {
        if (e.target === backdrop || e.target.dataset.action === 'close') backdrop.remove();
    });
    document.body.appendChild(backdrop);
}
