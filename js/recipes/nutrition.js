const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
};

export const ACTIVITY_LABELS = {
    sedentary: 'Sedentario (poco o ningún ejercicio)',
    light: 'Ligero (1-3 días/semana)',
    moderate: 'Moderado (3-5 días/semana)',
    active: 'Activo (6-7 días/semana)',
    veryActive: 'Muy activo (entreno intenso a diario)',
};

// Mifflin-St Jeor
export function calculateBMR({ sex, weightKg, heightCm, age }) {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return sex === 'male' ? base + 5 : base - 161;
}

export function calculateTargets({ sex, weightKg, heightCm, age, activityLevel, goal = 'lose' }) {
    const bmr = calculateBMR({ sex, weightKg, heightCm, age });
    const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

    let targetCalories = tdee;
    if (goal === 'lose') targetCalories = tdee * 0.8; // déficit ~20%
    if (goal === 'gain') targetCalories = tdee * 1.1;

    const minCalories = sex === 'male' ? 1500 : 1200;
    targetCalories = Math.max(minCalories, Math.round(targetCalories));

    const proteinG = Math.round(weightKg * 1.8);
    const fatCalories = targetCalories * 0.25;
    const fatG = Math.round(fatCalories / 9);
    const carbsCalories = targetCalories - proteinG * 4 - fatCalories;
    const carbsG = Math.round(Math.max(0, carbsCalories) / 4);

    return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories, proteinG, fatG, carbsG };
}
