// Store ingredients array
let ingredients = [];

// Function to validate ingredient
function validateIngredient(ingredient) {
    // Check if ingredient is only letters and spaces
    return /^[a-zA-Z\s]+$/.test(ingredient);
}

// Function to add ingredient with validation
function addIngredient() {
    const input = document.getElementById('ingredientInput');
    const ingredient = input.value.trim().toLowerCase();

    if (!ingredient) {
        showNotification('Please enter an ingredient!', 'error');
        return;
    }

    if (!validateIngredient(ingredient)) {
        showNotification('Please enter a valid ingredient (letters only)', 'error');
        return;
    }

    if (ingredients.includes(ingredient)) {
        showNotification('This ingredient is already in your list!', 'warning');
        input.value = '';
        return;
    }

    ingredients.push(ingredient);
    updateIngredientsList();
    input.value = '';
    showNotification('Ingredient added successfully!', 'success');
}

// Function to remove ingredient
function removeIngredient(index) {
    ingredients.splice(index, 1);
    updateIngredientsList();
    showNotification('Ingredient removed!', 'info');
}

// Function to clear all ingredients
function clearIngredients() {
    ingredients = [];
    updateIngredientsList();
    showNotification('All ingredients cleared!', 'info');
}

// Function to show notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Function to update ingredients list display
function updateIngredientsList() {
    const list = document.getElementById('ingredientsList');
    list.innerHTML = '';

    ingredients.forEach((ingredient, index) => {
        const tag = document.createElement('span');
        tag.className = 'ingredient-tag';
        tag.innerHTML = `
            ${ingredient}
            <button class="remove-ingredient" onclick="removeIngredient(${index})" 
                    aria-label="Remove ${ingredient}">×</button>
        `;
        list.appendChild(tag);
    });

    // Update clear all button visibility
    const clearButton = document.getElementById('clearAll');
    if (clearButton) {
        clearButton.style.display = ingredients.length ? 'block' : 'none';
    }
}

// Expanded recipe database
const recipeDatabase = [
    {
        name: "Vegetable Stir-Fry",
        ingredients: ["carrot", "broccoli", "onion", "garlic", "bell pepper"],
        instructions: "1. Chop all vegetables\n2. Heat oil in a pan\n3. Stir-fry vegetables until tender-crisp",
        difficulty: "Easy",
        prepTime: "15 minutes"
    },
    {
        name: "Simple Pasta",
        ingredients: ["pasta", "tomato", "garlic", "onion", "cheese"],
        instructions: "1. Cook pasta according to package\n2. Sauté garlic and onions\n3. Add tomatoes and cheese",
        difficulty: "Easy",
        prepTime: "20 minutes"
    },
    {
        name: "Rice Bowl",
        ingredients: ["rice", "egg", "carrot", "peas", "soy sauce"],
        instructions: "1. Cook rice\n2. Scramble eggs\n3. Mix in vegetables and soy sauce",
        difficulty: "Easy",
        prepTime: "25 minutes"
    },
    {
        name: "Vegetable Soup",
        ingredients: ["potato", "carrot", "celery", "onion", "garlic", "vegetable broth"],
        instructions: "1. Dice vegetables\n2. Sauté onions and garlic\n3. Add vegetables and broth\n4. Simmer until vegetables are tender",
        difficulty: "Medium",
        prepTime: "30 minutes"
    },
    {
        name: "Salad Bowl",
        ingredients: ["lettuce", "tomato", "cucumber", "onion", "olive oil"],
        instructions: "1. Wash and chop vegetables\n2. Combine in bowl\n3. Dress with olive oil",
        difficulty: "Easy",
        prepTime: "10 minutes"
    }
];

// Function to find matching recipes
function findRecipes() {
    if (ingredients.length === 0) {
        showNotification('Please add some ingredients first!', 'error');
        return;
    }

    const recipesSection = document.getElementById('recipesSection');
    recipesSection.innerHTML = '<h2>Matching Recipes</h2>';

    const matchingRecipes = recipeDatabase.filter(recipe => {
        const matchingIngredients = recipe.ingredients.filter(ingredient =>
            ingredients.includes(ingredient.toLowerCase())
        );
        return matchingIngredients.length >= recipe.ingredients.length * 0.6;
    });

    if (matchingRecipes.length === 0) {
        recipesSection.innerHTML += `
            <div class="recipe-card">
                <p>No recipes found with your ingredients. Try adding more ingredients!</p>
            </div>
        `;
        return;
    }

    // Sort recipes by matching ingredients count
    matchingRecipes.sort((a, b) => {
        const aMatches = a.ingredients.filter(ingredient =>
            ingredients.includes(ingredient.toLowerCase())
        ).length;
        const bMatches = b.ingredients.filter(ingredient =>
            ingredients.includes(ingredient.toLowerCase())
        ).length;
        return bMatches - aMatches;
    });

    // Display matching recipes
    matchingRecipes.forEach(recipe => {
        const matchingIngredients = recipe.ingredients.filter(ingredient =>
            ingredients.includes(ingredient.toLowerCase())
        );
        const missingIngredients = recipe.ingredients.filter(ingredient =>
            !ingredients.includes(ingredient.toLowerCase())
        );

        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <h3>${recipe.name}</h3>
            <div class="recipe-meta">
                <span><i class="fas fa-clock"></i> ${recipe.prepTime}</span>
                <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
            </div>
            <p><strong>Matching Ingredients:</strong> ${matchingIngredients.join(', ')}</p>
            ${missingIngredients.length > 0 ?
                `<p><strong>Missing Ingredients:</strong> ${missingIngredients.join(', ')}</p>` :
                '<p class="complete-match"><i class="fas fa-check-circle"></i> You have all the ingredients!</p>'
            }
            <p><strong>Instructions:</strong></p>
            <p>${recipe.instructions.split('\n').join('<br>')}</p>
        `;
        recipesSection.appendChild(recipeCard);
    });

    // Scroll to recipes section
    recipesSection.scrollIntoView({ behavior: 'smooth' });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for Enter key on ingredient input
    const ingredientInput = document.getElementById('ingredientInput');
    if (ingredientInput) {
        ingredientInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addIngredient();
            }
        });
    }

    // Add event listener for clear all button
    const clearButton = document.getElementById('clearAll');
    if (clearButton) {
        clearButton.addEventListener('click', clearIngredients);
    }

    // Initialize empty ingredients list
    updateIngredientsList();
});