import { uid } from '../storage.js';
import { MEAL_TYPES, addCustomRecipe } from './recipeData.js';
import { estimateRecipeTotals, INGREDIENT_NAMES } from './nutritionDB.js';

const UNITS = ['g', 'ml', 'ud', 'cda', 'cdta', 'rebanadas', 'cacito', 'bolsa'];

export function openRecipeForm(onSaved) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    let rows = [{ qty: '', unit: 'g', name: '' }];

    function render() {
        const totals = estimateRecipeTotals(rows.filter(r => r.name.trim()));

        backdrop.innerHTML = `
            <div class="modal-sheet">
                <div class="modal-header">
                    <button class="link-btn" data-action="cancel">Cancelar</button>
                    <h2>Nueva receta</h2>
                    <button class="link-btn" data-action="save">Guardar</button>
                </div>
                <div class="field">
                    <label>Nombre</label>
                    <input type="text" id="recipeName" placeholder="ej. Bowl de pollo y quinoa" />
                </div>
                <div class="field">
                    <label>Tipo de comida</label>
                    <select id="mealType">
                        ${MEAL_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>

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

                <div class="card">
                    <h3>Estimación</h3>
                    <div class="list-item"><span>Calorías</span><strong>${totals.calories} kcal</strong></div>
                    <div class="list-item"><span>Proteína</span><span>${totals.protein} g</span></div>
                    <div class="list-item"><span>Carbohidratos</span><span>${totals.carbs} g</span></div>
                    <div class="list-item"><span>Grasas</span><span>${totals.fat} g</span></div>
                    ${totals.unrecognized.length > 0 ? `
                        <p class="hint">No reconocido, no cuenta en la estimación: ${totals.unrecognized.join(', ')}. Prueba con el nombre exacto sugerido al escribir.</p>
                    ` : ''}
                </div>

                <div class="field">
                    <label>Preparación (opcional, un paso por línea)</label>
                    <textarea id="steps" rows="4" style="width:100%; font-size:15px; padding:10px 11px; border-radius:10px; border:1px solid var(--border); background:var(--surface-2); color:var(--text); font-family:inherit;"></textarea>
                </div>
            </div>
        `;

        // preserve values across re-render
        const nameInput = backdrop.querySelector('#recipeName');
        nameInput.value = state.name;
        nameInput.addEventListener('input', e => { state.name = e.target.value; });

        const mealSelect = backdrop.querySelector('#mealType');
        mealSelect.value = state.mealType;
        mealSelect.addEventListener('change', e => { state.mealType = e.target.value; });

        const stepsInput = backdrop.querySelector('#steps');
        stepsInput.value = state.steps;
        stepsInput.addEventListener('input', e => { state.steps = e.target.value; });

        backdrop.querySelectorAll('[data-row]').forEach(rowEl => {
            const idx = Number(rowEl.dataset.row);
            rowEl.querySelector('[data-field="qty"]').addEventListener('input', e => {
                rows[idx].qty = parseFloat(e.target.value) || 0;
                render();
            });
            rowEl.querySelector('[data-field="unit"]').addEventListener('change', e => {
                rows[idx].unit = e.target.value;
                render();
            });
            rowEl.querySelector('[data-field="name"]').addEventListener('input', e => {
                rows[idx].name = e.target.value;
                render();
            });
        });

        backdrop.querySelectorAll('[data-action="remove-row"]').forEach(btn => {
            btn.addEventListener('click', () => {
                rows.splice(Number(btn.dataset.idx), 1);
                render();
            });
        });

        backdrop.querySelector('#addIngredientBtn').addEventListener('click', () => {
            rows.push({ qty: '', unit: 'g', name: '' });
            render();
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
                ingredients: validRows.map(r => ({ qty: r.qty, unit: r.unit, name: r.name.trim().toLowerCase() })),
                steps: state.steps.split('\n').map(s => s.trim()).filter(Boolean),
                custom: true,
            };
            addCustomRecipe(recipe);
            backdrop.remove();
            onSaved(recipe);
        });
    }

    const state = { name: '', mealType: 'Comida', steps: '' };
    render();
}
