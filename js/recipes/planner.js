import { Store, uid } from '../storage.js';
import { recipesByType, getRecipe, formatIngredient, deleteCustomRecipe } from './recipeData.js';
import { calculateTargets, ACTIVITY_LABELS } from './nutrition.js';
import { buildShoppingList, formatQty } from './shoppingList.js';
import { openRecipeForm } from './customRecipeForm.js';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function renderRecipes(root) {
    const profile = Store.profile;
    const wrap = document.createElement('div');
    root.innerHTML = '';
    root.appendChild(wrap);

    if (!profile || !profile.age || !profile.heightCm || !profile.sex || !profile.activityLevel) {
        wrap.appendChild(profileForm(root));
        return;
    }

    const latestWeight = [...Store.weightEntries].sort((a, b) => b.date - a.date)[0]?.weight ?? profile.goalWeightKg ?? 70;
    const targets = calculateTargets({
        sex: profile.sex,
        weightKg: latestWeight,
        heightCm: profile.heightCm,
        age: profile.age,
        activityLevel: profile.activityLevel,
        goal: 'lose',
    });

    const summary = document.createElement('div');
    summary.className = 'card';
    summary.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3>Tu objetivo diario</h3>
            <button class="link-btn" id="editProfileBtn">Editar perfil</button>
        </div>
        <div class="list-item"><span>Calorías (déficit ~20%)</span><strong>${targets.targetCalories} kcal</strong></div>
        <div class="list-item"><span>Proteína</span><span>${targets.proteinG} g</span></div>
        <div class="list-item"><span>Carbohidratos</span><span>${targets.carbsG} g</span></div>
        <div class="list-item"><span>Grasas</span><span>${targets.fatG} g</span></div>
        <p class="hint">Basado en peso actual ${latestWeight} kg. Recetas todas sin gluten.</p>
    `;
    wrap.appendChild(summary);
    summary.querySelector('#editProfileBtn').addEventListener('click', () => {
        wrap.innerHTML = '';
        wrap.appendChild(profileForm(root));
    });

    let plan = Store.weeklyPlan;
    if (!plan || plan.targetCalories !== targets.targetCalories) {
        plan = generateWeeklyPlan(targets.targetCalories);
        Store.weeklyPlan = plan;
    }

    const regenBtn = document.createElement('button');
    regenBtn.className = 'btn secondary block';
    regenBtn.textContent = '🔀 Regenerar plan semanal';
    regenBtn.style.marginBottom = '14px';
    regenBtn.addEventListener('click', () => {
        Store.weeklyPlan = generateWeeklyPlan(targets.targetCalories);
        renderRecipes(root);
    });
    wrap.appendChild(regenBtn);

    const shoppingBtn = document.createElement('button');
    shoppingBtn.className = 'btn block';
    shoppingBtn.textContent = '🛒 Lista de la compra';
    shoppingBtn.style.marginBottom = '14px';
    shoppingBtn.addEventListener('click', () => openShoppingList(plan));
    wrap.appendChild(shoppingBtn);

    wrap.appendChild(customRecipesSection(root));

    plan.days.forEach((day, idx) => {
        const dayCard = document.createElement('div');
        dayCard.className = 'card day-block';
        const dayTotal = day.meals.reduce((sum, m) => sum + getRecipe(m.recipeId).calories, 0);
        dayCard.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <h3>${DAYS[idx]}</h3>
                <span class="badge">${dayTotal} kcal</span>
            </div>
            ${day.meals.map(m => {
                const r = getRecipe(m.recipeId);
                return `
                    <div class="meal-row" data-recipe="${r.id}" style="cursor:pointer">
                        <span>${r.mealType}: ${r.name}</span>
                        <span class="meta">${r.calories} kcal</span>
                    </div>
                `;
            }).join('')}
        `;
        dayCard.querySelectorAll('[data-recipe]').forEach(el => {
            el.addEventListener('click', () => openRecipeDetail(getRecipe(el.dataset.recipe)));
        });
        wrap.appendChild(dayCard);
    });
}

function generateWeeklyPlan(targetCalories) {
    const byType = {
        Desayuno: recipesByType('Desayuno'),
        Comida: recipesByType('Comida'),
        Cena: recipesByType('Cena'),
        Snack: recipesByType('Snack'),
    };

    const days = DAYS.map(() => {
        let best = null;
        let bestDiff = Infinity;
        for (let attempt = 0; attempt < 20; attempt++) {
            const meals = [
                { mealType: 'Desayuno', recipeId: pickRandom(byType.Desayuno).id },
                { mealType: 'Comida', recipeId: pickRandom(byType.Comida).id },
                { mealType: 'Cena', recipeId: pickRandom(byType.Cena).id },
                { mealType: 'Snack', recipeId: pickRandom(byType.Snack).id },
            ];
            const total = meals.reduce((sum, m) => sum + getRecipe(m.recipeId).calories, 0);
            const diff = Math.abs(total - targetCalories);
            if (diff < bestDiff) { bestDiff = diff; best = meals; }
        }
        return { meals: best };
    });

    return { id: uid(), targetCalories, days, createdAt: Date.now() };
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function openRecipeDetail(recipe) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
        <div class="modal-sheet">
            <div class="modal-header">
                <span></span>
                <h2>${recipe.name}</h2>
                <button class="link-btn" data-action="close">Cerrar</button>
            </div>
            ${recipe.photo ? `<img src="${recipe.photo}" alt="" style="width:100%; max-height:240px; object-fit:cover; border-radius:14px; display:block; margin-bottom:12px;" />` : ''}
            <div class="card">
                <div class="list-item"><span>Calorías</span><strong>${recipe.calories} kcal</strong></div>
                <div class="list-item"><span>Proteína</span><span>${recipe.protein} g</span></div>
                <div class="list-item"><span>Carbohidratos</span><span>${recipe.carbs} g</span></div>
                <div class="list-item"><span>Grasas</span><span>${recipe.fat} g</span></div>
            </div>
            <h3>Ingredientes</h3>
            <div class="card"><ul>${recipe.ingredients.map(ing => `<li>${formatIngredient(ing)}</li>`).join('')}</ul></div>
            <h3>Preparación</h3>
            <div class="card"><ol>${recipe.steps.map(s => `<li>${s}</li>`).join('')}</ol></div>
        </div>
    `;
    backdrop.addEventListener('click', e => {
        if (e.target === backdrop || e.target.dataset.action === 'close') backdrop.remove();
    });
    document.body.appendChild(backdrop);
}

function openShoppingList(plan) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);

    function render() {
        const currentPlan = Store.weeklyPlan;
        const checked = currentPlan.shoppingChecked ?? {};
        const groups = buildShoppingList(currentPlan);

        backdrop.innerHTML = `
            <div class="modal-sheet">
                <div class="modal-header">
                    <span></span>
                    <h2>Lista de la compra</h2>
                    <button class="link-btn" data-action="close">Cerrar</button>
                </div>
                <p class="hint">Suma automática de los ingredientes de las ${plan.days.length} comidas del plan semanal. No incluye básicos de despensa (sal, aceite, especias).</p>
                ${groups.map(g => `
                    <h3>${g.category}</h3>
                    <div class="card" style="padding:0 14px">
                        ${g.items.map(item => `
                            <div class="list-item" data-item="${item.key}" style="cursor:pointer">
                                <span style="${checked[item.key] ? 'text-decoration:line-through; color:var(--text-secondary)' : ''}">${item.name}</span>
                                <span style="display:flex; align-items:center; gap:8px;">
                                    <span class="meta" style="color:var(--text-secondary); font-size:12px">${formatQty(item)}</span>
                                    <span class="check-btn ${checked[item.key] ? 'done' : ''}" style="width:26px;height:26px;font-size:13px">${checked[item.key] ? '✓' : ''}</span>
                                </span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;

        backdrop.querySelectorAll('[data-item]').forEach(row => {
            row.addEventListener('click', () => {
                const key = row.dataset.item;
                const p = Store.weeklyPlan;
                p.shoppingChecked = { ...(p.shoppingChecked ?? {}), [key]: !(p.shoppingChecked ?? {})[key] };
                Store.weeklyPlan = p;
                render();
            });
        });
    }

    backdrop.addEventListener('click', e => {
        if (e.target === backdrop || e.target.dataset.action === 'close') backdrop.remove();
    });
    render();
}

function customRecipesSection(root) {
    const section = document.createElement('div');
    section.className = 'card';

    function render() {
        const custom = Store.customRecipes;
        section.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Tus recetas</h3>
                <button class="link-btn" id="createRecipeBtn">+ Crear receta</button>
            </div>
            ${custom.length === 0
                ? '<p class="hint">Crea tus propias recetas indicando los ingredientes: estimamos las calorías automáticamente y podrán aparecer en tu plan semanal.</p>'
                : custom.map(r => `
                    <div class="list-item" data-recipe="${r.id}" style="cursor:pointer">
                        <span style="display:flex; align-items:center; gap:10px; min-width:0;">
                            ${r.photo ? `<img src="${r.photo}" alt="" style="width:40px; height:40px; object-fit:cover; border-radius:9px; flex-shrink:0;" />` : ''}
                            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${r.mealType}: ${r.name}</span>
                        </span>
                        <span style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                            <span class="meta" style="color:var(--text-secondary); font-size:12px">${r.calories} kcal</span>
                            <button class="link-btn" data-delete="${r.id}" style="color:var(--danger)">🗑️</button>
                        </span>
                    </div>
                `).join('')
            }
        `;

        section.querySelector('#createRecipeBtn').addEventListener('click', () => {
            openRecipeForm(() => {
                render();
            });
        });
        section.querySelectorAll('[data-recipe]').forEach(el => {
            el.addEventListener('click', e => {
                if (e.target.closest('[data-delete]')) return;
                openRecipeDetail(getRecipe(el.dataset.recipe));
            });
        });
        section.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!confirm('¿Eliminar esta receta?')) return;
                deleteCustomRecipe(btn.dataset.delete);
                renderRecipes(root);
            });
        });
    }

    render();
    return section;
}

function profileForm(root) {
    const profile = Store.profile ?? {};
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="card">
            <h3>Tu perfil</h3>
            <p class="hint">Lo usamos para calcular tu objetivo calórico y de macros. Solo se guarda en este dispositivo.</p>
            <div class="field">
                <label>Sexo</label>
                <select id="sexInput">
                    <option value="female" ${profile.sex === 'female' ? 'selected' : ''}>Mujer</option>
                    <option value="male" ${profile.sex === 'male' ? 'selected' : ''}>Hombre</option>
                </select>
            </div>
            <div class="field">
                <label>Edad</label>
                <input type="number" id="ageInput" value="${profile.age ?? ''}" placeholder="ej. 32" />
            </div>
            <div class="field">
                <label>Altura (cm)</label>
                <input type="number" id="heightInput" value="${profile.heightCm ?? ''}" placeholder="ej. 165" />
            </div>
            <div class="field">
                <label>Nivel de actividad</label>
                <select id="activityInput">
                    ${Object.entries(ACTIVITY_LABELS).map(([key, label]) => `
                        <option value="${key}" ${profile.activityLevel === key ? 'selected' : ''}>${label}</option>
                    `).join('')}
                </select>
            </div>
            <button class="btn block" id="saveProfileBtn">Guardar y calcular</button>
        </div>
    `;
    container.querySelector('#saveProfileBtn').addEventListener('click', () => {
        const sex = container.querySelector('#sexInput').value;
        const age = parseInt(container.querySelector('#ageInput').value);
        const heightCm = parseFloat(container.querySelector('#heightInput').value);
        const activityLevel = container.querySelector('#activityInput').value;
        if (!age || !heightCm) { alert('Introduce edad y altura.'); return; }
        Store.profile = { ...Store.profile, sex, age, heightCm, activityLevel };
        Store.weeklyPlan = null;
        renderRecipes(root);
    });
    return container;
}
