import { uid } from '../storage.js';
import { MEAL_TYPES, addCustomRecipe } from './recipeData.js';
import { estimateRecipeTotals, INGREDIENT_NAMES } from './nutritionDB.js';
import { compressImageFile } from './imageUtils.js';
import { parseRecipeText } from './recipeTextParser.js';

const UNITS = ['g', 'ml', 'ud', 'cda', 'cdta', 'rebanadas', 'cacito', 'bolsa'];

export function openRecipeForm(onSaved) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    const state = { name: '', mealType: 'Comida', steps: '', photo: null, pasteOpen: false };
    let rows = [{ qty: '', unit: 'g', name: '' }];

    function estimationHtml() {
        const totals = estimateRecipeTotals(rows.filter(r => r.name.trim()));
        return `
            <h3>Estimación</h3>
            <div class="list-item"><span>Calorías</span><strong>${totals.calories} kcal</strong></div>
            <div class="list-item"><span>Proteína</span><span>${totals.protein} g</span></div>
            <div class="list-item"><span>Carbohidratos</span><span>${totals.carbs} g</span></div>
            <div class="list-item"><span>Grasas</span><span>${totals.fat} g</span></div>
            ${totals.unrecognized.length > 0 ? `
                <p class="hint">No reconocido, no cuenta en la estimación: ${totals.unrecognized.join(', ')}. Prueba con el nombre exacto sugerido al escribir.</p>
            ` : ''}
        `;
    }

    function updateEstimate() {
        backdrop.querySelector('#estimationCard').innerHTML = estimationHtml();
    }

    function photoHtml() {
        if (state.photo) {
            return `
                <img src="${state.photo}" alt="" style="width:100%; max-height:220px; object-fit:cover; border-radius:12px; display:block; margin-bottom:8px;" />
                <button class="link-btn" id="removePhotoBtn" style="color:var(--danger)">Quitar foto</button>
            `;
        }
        return `
            <input type="file" accept="image/*" id="photoInput" />
            <p class="hint">Añade una foto desde la cámara o tu galería (se comprime automáticamente).</p>
        `;
    }

    function updatePhotoSection() {
        backdrop.querySelector('#photoSection').innerHTML = photoHtml();
        bindPhotoEvents();
    }

    function bindPhotoEvents() {
        const input = backdrop.querySelector('#photoInput');
        if (input) {
            input.addEventListener('change', async e => {
                const file = e.target.files[0];
                if (!file) return;
                try {
                    state.photo = await compressImageFile(file);
                    updatePhotoSection();
                } catch {
                    alert('No se pudo procesar la imagen.');
                }
            });
        }
        const removeBtn = backdrop.querySelector('#removePhotoBtn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                state.photo = null;
                updatePhotoSection();
            });
        }
    }

    // Reconstruye todo el formulario. Solo debe llamarse tras acciones puntuales
    // (añadir/quitar ingrediente, pegar receta), nunca en cada tecla: si no, el
    // input pierde el foco y en móvil se cierra el teclado.
    function renderShell() {
        backdrop.innerHTML = `
            <div class="modal-sheet">
                <div class="modal-header">
                    <button class="link-btn" data-action="cancel">Cancelar</button>
                    <h2>Nueva receta</h2>
                    <button class="link-btn" data-action="save">Guardar</button>
                </div>

                <button class="link-btn" id="togglePasteBtn" style="margin-bottom:8px">📋 Pegar receta (Instagram, notas...)</button>
                <div id="pasteSection" style="display:${state.pasteOpen ? 'block' : 'none'}; margin-bottom:14px">
                    <textarea id="pasteText" rows="6" placeholder="Pega aquí el texto de la publicación (ingredientes y/o pasos)..." style="width:100%; font-size:15px; padding:10px 11px; border-radius:10px; border:1px solid var(--border); background:var(--surface-2); color:var(--text); font-family:inherit;"></textarea>
                    <button class="btn secondary block" id="detectBtn" style="margin:8px 0 4px">Detectar ingredientes</button>
                    <p class="hint">La detección es orientativa: revisa y ajusta el resultado antes de guardar.</p>
                </div>

                <div class="field">
                    <label>Nombre</label>
                    <input type="text" id="recipeName" placeholder="ej. Bowl de pollo y quinoa" value="${state.name}" />
                </div>
                <div class="field">
                    <label>Tipo de comida</label>
                    <select id="mealType">
                        ${MEAL_TYPES.map(t => `<option value="${t}" ${state.mealType === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>

                <h3>Foto (opcional)</h3>
                <div class="card" id="photoSection">${photoHtml()}</div>

                <h3>Ingredientes</h3>
                <div class="card">
                    ${rows.map((row, idx) => `
                        <div class="set-row" style="grid-template-columns: 60px 70px 1fr 34px" data-row="${idx}">
                            <input type="number" step="any" placeholder="cant." data-field="qty" value="${row.qty}" />
                            <select data-field="unit">
                                ${UNITS.map(u => `<option value="${u}" ${row.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
                            </select>
                            <input type="text" list="ingredientOptions" placeholder="ingrediente (ej. pechuga de pollo)" data-field="name" value="${row.name}" />
                            <button class="link-btn" data-action="remove-row" data-idx="${idx}" style="color:var(--danger)">✕</button>
                        </div>
                    `).join('')}
                    <button class="link-btn" id="addIngredientBtn" style="margin-top:6px">+ Añadir ingrediente</button>
                </div>
                <datalist id="ingredientOptions">
                    ${INGREDIENT_NAMES.map(n => `<option value="${n}">`).join('')}
                </datalist>

                <div class="card" id="estimationCard">${estimationHtml()}</div>

                <div class="field">
                    <label>Preparación (opcional, un paso por línea)</label>
                    <textarea id="steps" rows="4" style="width:100%; font-size:15px; padding:10px 11px; border-radius:10px; border:1px solid var(--border); background:var(--surface-2); color:var(--text); font-family:inherit;">${state.steps}</textarea>
                </div>
            </div>
        `;

        backdrop.querySelector('#togglePasteBtn').addEventListener('click', () => {
            state.pasteOpen = !state.pasteOpen;
            backdrop.querySelector('#pasteSection').style.display = state.pasteOpen ? 'block' : 'none';
        });
        backdrop.querySelector('#detectBtn').addEventListener('click', () => {
            const text = backdrop.querySelector('#pasteText').value;
            if (!text.trim()) { alert('Pega primero el texto de la receta.'); return; }
            const result = parseRecipeText(text);
            if (result.name && !state.name) state.name = result.name;
            if (result.ingredients.length > 0) {
                rows = rows.filter(r => r.qty !== '' || r.name.trim() !== '');
                rows.push(...result.ingredients);
                if (rows.length === 0) rows = [{ qty: '', unit: 'g', name: '' }];
            }
            if (result.steps.length > 0) {
                state.steps = [state.steps, ...result.steps].filter(Boolean).join('\n');
            }
            if (result.ingredients.length === 0 && result.steps.length === 0) {
                alert('No se detectó nada reconocible en ese texto. Puedes añadir los ingredientes a mano.');
            }
            renderShell();
        });

        bindPhotoEvents();

        backdrop.querySelector('#recipeName').addEventListener('input', e => { state.name = e.target.value; });
        backdrop.querySelector('#mealType').addEventListener('change', e => { state.mealType = e.target.value; });
        backdrop.querySelector('#steps').addEventListener('input', e => { state.steps = e.target.value; });

        backdrop.querySelectorAll('[data-row]').forEach(rowEl => {
            const idx = Number(rowEl.dataset.row);
            rowEl.querySelector('[data-field="qty"]').addEventListener('input', e => {
                rows[idx].qty = parseFloat(e.target.value) || 0;
                updateEstimate();
            });
            rowEl.querySelector('[data-field="unit"]').addEventListener('change', e => {
                rows[idx].unit = e.target.value;
                updateEstimate();
            });
            rowEl.querySelector('[data-field="name"]').addEventListener('input', e => {
                rows[idx].name = e.target.value;
                updateEstimate();
            });
        });

        backdrop.querySelectorAll('[data-action="remove-row"]').forEach(btn => {
            btn.addEventListener('click', () => {
                rows.splice(Number(btn.dataset.idx), 1);
                renderShell();
            });
        });

        backdrop.querySelector('#addIngredientBtn').addEventListener('click', () => {
            rows.push({ qty: '', unit: 'g', name: '' });
            renderShell();
        });

        backdrop.querySelector('[data-action="cancel"]').addEventListener('click', () => backdrop.remove());
        backdrop.querySelector('[data-action="save"]').addEventListener('click', () => {
            const validRows = rows.filter(r => r.name.trim() && r.qty > 0);
            if (!state.name.trim() || validRows.length === 0) {
                alert('Ponle un nombre a la receta y añade al menos un ingrediente con cantidad.');
                return;
            }
            const finalTotals = estimateRecipeTotals(validRows);
            const recipe = {
                id: uid(),
                name: state.name.trim(),
                mealType: state.mealType,
                calories: finalTotals.calories,
                protein: finalTotals.protein,
                carbs: finalTotals.carbs,
                fat: finalTotals.fat,
                photo: state.photo,
                ingredients: validRows.map(r => ({ qty: r.qty, unit: r.unit, name: r.name.trim().toLowerCase() })),
                steps: state.steps.split('\n').map(s => s.trim()).filter(Boolean),
                custom: true,
            };
            addCustomRecipe(recipe);
            backdrop.remove();
            onSaved(recipe);
        });
    }

    renderShell();
}
