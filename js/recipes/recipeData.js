// Todas las recetas son sin gluten. Macros aproximados por ración.
// Ingredientes estructurados como {qty, unit, name, pantry?} para poder sumarlos
// en la lista de la compra. pantry:true = básico de despensa, no se pide comprar.
function i(qty, unit, name) { return { qty, unit, name }; }
function pantry(name) { return { qty: null, unit: '', name, pantry: true }; }

export const RECIPES = [
    // Desayunos
    { id: 'b1', name: 'Yogur griego con frutos rojos y nueces', mealType: 'Desayuno', calories: 320, protein: 22, carbs: 24, fat: 15,
      ingredients: [i(200, 'g', 'yogur griego natural'), i(80, 'g', 'frutos rojos'), i(15, 'g', 'nueces'), i(1, 'cdta', 'miel')],
      steps: ['Mezcla el yogur con la miel.', 'Añade los frutos rojos y las nueces por encima.'] },
    { id: 'b2', name: 'Tortilla de claras con espinacas y aguacate', mealType: 'Desayuno', calories: 350, protein: 28, carbs: 12, fat: 21,
      ingredients: [i(4, 'ud', 'claras de huevo'), i(1, 'ud', 'huevo'), i(50, 'g', 'espinacas'), i(0.5, 'ud', 'aguacate'), pantry('sal'), pantry('pimienta')],
      steps: ['Saltea las espinacas 1 min.', 'Bate los huevos y cuaja en la sartén con las espinacas.', 'Sirve con el aguacate en láminas.'] },
    { id: 'b3', name: 'Porridge de copos de avena sin gluten con plátano', mealType: 'Desayuno', calories: 380, protein: 14, carbs: 58, fat: 10,
      ingredients: [i(50, 'g', 'copos de avena sin gluten'), i(200, 'ml', 'leche'), i(1, 'ud', 'plátano'), pantry('canela')],
      steps: ['Cuece la avena con la leche 5 min removiendo.', 'Sirve con el plátano en rodajas y canela.'] },
    { id: 'b4', name: 'Tostadas de pan sin gluten con huevo y tomate', mealType: 'Desayuno', calories: 340, protein: 18, carbs: 32, fat: 15,
      ingredients: [i(2, 'rebanadas', 'pan sin gluten'), i(2, 'ud', 'huevo'), i(1, 'ud', 'tomate'), pantry('aceite de oliva')],
      steps: ['Tuesta el pan.', 'Cocina los huevos a la plancha o escalfados.', 'Sirve con el tomate rallado y un chorrito de aceite.'] },
    { id: 'b5', name: 'Batido de proteína, plátano y mantequilla de cacahuete', mealType: 'Desayuno', calories: 360, protein: 30, carbs: 30, fat: 12,
      ingredients: [i(1, 'cacito', 'proteína en polvo sin gluten'), i(1, 'ud', 'plátano'), i(15, 'g', 'mantequilla de cacahuete'), i(200, 'ml', 'leche')],
      steps: ['Bate todos los ingredientes hasta que quede homogéneo.'] },
    { id: 'b6', name: 'Bowl de requesón con manzana y canela', mealType: 'Desayuno', calories: 300, protein: 24, carbs: 28, fat: 9,
      ingredients: [i(200, 'g', 'requesón'), i(1, 'ud', 'manzana'), pantry('canela'), i(10, 'g', 'almendras')],
      steps: ['Corta la manzana en dados.', 'Mezcla con el requesón y espolvorea canela y almendras.'] },

    // Comidas / Almuerzos
    { id: 'l1', name: 'Pollo a la plancha con arroz integral y brócoli', mealType: 'Comida', calories: 520, protein: 42, carbs: 52, fat: 14,
      ingredients: [i(150, 'g', 'pechuga de pollo'), i(70, 'g', 'arroz integral'), i(150, 'g', 'brócoli'), pantry('aceite de oliva'), pantry('ajo')],
      steps: ['Cuece el arroz según el envase.', 'Cocina el pollo a la plancha con ajo.', 'Cuece el brócoli al vapor y sirve todo junto.'] },
    { id: 'l2', name: 'Salmón al horno con patata y ensalada', mealType: 'Comida', calories: 560, protein: 38, carbs: 40, fat: 24,
      ingredients: [i(150, 'g', 'salmón'), i(200, 'g', 'patata'), i(1, 'bolsa', 'ensalada verde'), i(1, 'ud', 'limón'), pantry('aceite de oliva')],
      steps: ['Hornea el salmón con limón 15 min a 200°C.', 'Cuece o asa la patata.', 'Sirve con la ensalada aliñada.'] },
    { id: 'l3', name: 'Ternera salteada con verduras y fideos de arroz', mealType: 'Comida', calories: 540, protein: 40, carbs: 48, fat: 18,
      ingredients: [i(150, 'g', 'ternera en tiras'), i(80, 'g', 'fideos de arroz'), i(1, 'ud', 'pimiento'), i(1, 'ud', 'calabacín'), i(1, 'ud', 'zanahoria'), i(1, 'cda', 'salsa de soja sin gluten')],
      steps: ['Cuece los fideos de arroz.', 'Saltea la ternera y las verduras a fuego fuerte.', 'Mezcla con la salsa de soja sin gluten.'] },
    { id: 'l4', name: 'Lentejas estofadas con verduras', mealType: 'Comida', calories: 480, protein: 26, carbs: 62, fat: 12,
      ingredients: [i(150, 'g', 'lentejas'), i(1, 'ud', 'zanahoria'), i(1, 'ud', 'cebolla'), i(1, 'ud', 'pimiento'), i(200, 'g', 'tomate triturado'), pantry('aceite de oliva')],
      steps: ['Sofríe la verdura.', 'Añade las lentejas, el tomate y cubre con agua.', 'Cuece 30-35 min hasta que estén tiernas.'] },
    { id: 'l5', name: 'Ensalada de quinoa, garbanzos, feta y pepino', mealType: 'Comida', calories: 500, protein: 22, carbs: 54, fat: 20,
      ingredients: [i(70, 'g', 'quinoa'), i(100, 'g', 'garbanzos cocidos'), i(50, 'g', 'queso feta'), i(1, 'ud', 'pepino'), i(100, 'g', 'tomate cherry'), pantry('aceite de oliva')],
      steps: ['Cuece la quinoa y deja enfriar.', 'Mezcla con el resto de ingredientes.', 'Aliña con aceite de oliva y limón.'] },
    { id: 'l6', name: 'Merluza a la plancha con puré de boniato', mealType: 'Comida', calories: 460, protein: 36, carbs: 44, fat: 12,
      ingredients: [i(180, 'g', 'merluza'), i(200, 'g', 'boniato'), i(80, 'g', 'espinacas'), pantry('aceite de oliva')],
      steps: ['Cuece el boniato y haz puré.', 'Cocina la merluza a la plancha.', 'Sirve con las espinacas salteadas.'] },

    // Cenas
    { id: 'd1', name: 'Revuelto de huevos con champiñones y jamón', mealType: 'Cena', calories: 380, protein: 28, carbs: 8, fat: 26,
      ingredients: [i(3, 'ud', 'huevo'), i(100, 'g', 'champiñones'), i(50, 'g', 'jamón serrano'), pantry('aceite de oliva')],
      steps: ['Saltea los champiñones y el jamón.', 'Añade los huevos batidos y cuaja a fuego medio.'] },
    { id: 'd2', name: 'Pescado blanco al vapor con calabacín y zanahoria', mealType: 'Cena', calories: 340, protein: 34, carbs: 18, fat: 14,
      ingredients: [i(180, 'g', 'pescado blanco'), i(1, 'ud', 'calabacín'), i(1, 'ud', 'zanahoria'), i(1, 'ud', 'limón'), pantry('aceite de oliva')],
      steps: ['Cuece las verduras y el pescado al vapor 10-12 min.', 'Aliña con aceite de oliva y limón.'] },
    { id: 'd3', name: 'Ensalada templada de pollo, espinacas y frutos secos', mealType: 'Cena', calories: 400, protein: 36, carbs: 16, fat: 22,
      ingredients: [i(150, 'g', 'pechuga de pollo'), i(80, 'g', 'espinacas'), i(15, 'g', 'nueces'), pantry('aceite de oliva'), pantry('vinagre')],
      steps: ['Cocina el pollo a la plancha y córtalo en tiras.', 'Mezcla con las espinacas y los frutos secos.', 'Aliña al gusto.'] },
    { id: 'd4', name: 'Tortilla de calabacín con ensalada', mealType: 'Cena', calories: 360, protein: 22, carbs: 14, fat: 24,
      ingredients: [i(3, 'ud', 'huevo'), i(1, 'ud', 'calabacín'), i(1, 'ud', 'cebolla'), i(1, 'bolsa', 'ensalada verde')],
      steps: ['Saltea el calabacín y la cebolla.', 'Añade los huevos batidos y cuaja la tortilla.', 'Sirve con ensalada.'] },
    { id: 'd5', name: 'Gambas salteadas con verduras al wok', mealType: 'Cena', calories: 320, protein: 30, carbs: 20, fat: 12,
      ingredients: [i(180, 'g', 'gambas peladas'), i(1, 'ud', 'pimiento'), i(150, 'g', 'brócoli'), i(50, 'g', 'brotes de soja'), i(1, 'cda', 'salsa de soja sin gluten'), pantry('ajo'), pantry('jengibre')],
      steps: ['Saltea el ajo y el jengibre.', 'Añade las verduras y las gambas a fuego fuerte.', 'Termina con la salsa de soja sin gluten.'] },
    { id: 'd6', name: 'Crema de calabaza con pollo desmenuzado', mealType: 'Cena', calories: 350, protein: 26, carbs: 30, fat: 12,
      ingredients: [i(300, 'g', 'calabaza'), i(300, 'ml', 'caldo de verduras'), i(100, 'g', 'pechuga de pollo'), pantry('nuez moscada')],
      steps: ['Cuece la calabaza en el caldo y tritura.', 'Sirve con el pollo desmenuzado por encima.'] },

    // Snacks
    { id: 's1', name: 'Puñado de almendras y una pieza de fruta', mealType: 'Snack', calories: 200, protein: 6, carbs: 22, fat: 11,
      ingredients: [i(20, 'g', 'almendras'), i(1, 'ud', 'manzana')], steps: ['Listo para comer.'] },
    { id: 's2', name: 'Yogur natural con semillas de chía', mealType: 'Snack', calories: 180, protein: 12, carbs: 14, fat: 8,
      ingredients: [i(150, 'g', 'yogur natural'), i(10, 'g', 'semillas de chía')], steps: ['Mezcla y deja reposar 5 min.'] },
    { id: 's3', name: 'Queso fresco con nueces', mealType: 'Snack', calories: 190, protein: 14, carbs: 6, fat: 13,
      ingredients: [i(100, 'g', 'queso fresco batido'), i(15, 'g', 'nueces')], steps: ['Mezcla y sirve.'] },
    { id: 's4', name: 'Hummus con bastones de zanahoria y pepino', mealType: 'Snack', calories: 170, protein: 6, carbs: 18, fat: 8,
      ingredients: [i(60, 'g', 'hummus'), i(1, 'ud', 'zanahoria'), i(1, 'ud', 'pepino')], steps: ['Corta las verduras y sirve con el hummus.'] },
];

export const MEAL_TYPES = ['Desayuno', 'Comida', 'Cena', 'Snack'];

export function recipesByType(type) {
    return RECIPES.filter(r => r.mealType === type);
}

export function getRecipe(id) {
    return RECIPES.find(r => r.id === id);
}

export function formatIngredient(ing) {
    if (ing.pantry) return `${ing.name} (al gusto)`;
    const qty = Number.isInteger(ing.qty) ? ing.qty : ing.qty.toFixed(1).replace(/\.0$/, '');
    const unit = ing.unit === 'ud' ? '' : ing.unit;
    return [qty, unit, ing.name].filter(Boolean).join(' ');
}
