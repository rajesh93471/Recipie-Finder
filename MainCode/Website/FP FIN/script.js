const searchInput = document.getElementById('searchInput');
const recipesList = document.getElementById('recipesList');
const modal = document.getElementById('recipeModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.querySelector('.close-btn');

// Replace with your Recipe Ninja API key
const API_KEY = 'qYp0zwcp2QK4TpU8zLbyfg==RQALb3mTE2NeerX5';
const MEAL_DB_API = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

// Popular recipe categories with emojis
const popularCategories = [
    { name: 'Pasta', emoji: '🍝' },
    { name: 'Chicken', emoji: '🍗' },
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Salad', emoji: '🥗' },
    { name: 'Soup', emoji: '🥣' },
    { name: 'Cake', emoji: '🍰' },
    { name: 'Curry', emoji: '🍛' },
    { name: 'Rice', emoji: '🍚' },
    { name: 'Fish', emoji: '🐟' },
    { name: 'Bread', emoji: '🍞' }
];

const foodIcons = ['🍲', '🥘', '🍝', '🥗', '🍜', '🍛', '🥪', '🌮', '🍕', '🥩'];

// Get random icon
function getRandomIcon() {
    return foodIcons[Math.floor(Math.random() * foodIcons.length)];
}

// Create and add preview modal to the page
function createPreviewModal() {
    // First remove any existing preview modal
    const existingModal = document.querySelector('.preview-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = `
        <div class="preview-modal-content">
            <img src="" alt="Recipe Preview">
            <button class="preview-close-btn">×</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal when clicking the close button
    const closeBtn = modal.querySelector('.preview-close-btn');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.classList.remove('active');
    });

    // Close modal when clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    return modal;
}

// Add necessary styles to the document
function addPreviewModalStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .preview-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }

        .preview-modal.active {
            display: flex;
        }

        .preview-modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }

        .preview-modal img {
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 8px;
        }

        .preview-close-btn {
            position: absolute;
            top: -40px;
            right: -40px;
            background: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .preview-btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 8px;
            transition: background-color 0.3s;
        }

        .preview-btn:hover {
            background-color: #45a049;
        }
    `;
    document.head.appendChild(styleElement);
}

// Show loading state
function showLoading() {
    recipesList.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Brewing up some delicious recipes...</p>
        </div>
    `;
}

// Get recipe image from TheMealDB
async function getRecipeImage(title) {
    try {
        const response = await fetch(MEAL_DB_API + encodeURIComponent(title));
        const data = await response.json();
        return data.meals && data.meals[0]
            ? data.meals[0].strMealThumb
            : '/api/placeholder/400/320';
    } catch (error) {
        console.error('Error fetching image:', error);
        return '/api/placeholder/400/320';
    }
}

// Format instructions for better readability
function formatInstructions(instructions) {
    if (!instructions) return '<li>No instructions available.</li>';

    if (instructions.includes('|')) {
        return instructions
            .split('|')
            .map(step => `<li>${step.trim()}</li>`)
            .join('');
    }

    const steps = instructions.split(/(?<=[.!?])\s+(?=[A-Z])/);
    return steps
        .filter(step => step.trim())
        .map(step => `<li>${step.trim().replace(/"/g, '')}</li>`)
        .join('');
}

// Search recipes from Recipe Ninja API
async function searchRecipes(query) {
    if (!query.trim()) {
        showWelcomeScreen();
        return;
    }

    showLoading();

    try {
        const response = await fetch(
            'https://api.api-ninjas.com/v1/recipe?query=' + encodeURIComponent(query),
            {
                method: 'GET',
                headers: {
                    'X-Api-Key': API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const recipes = await response.json();

        if (recipes && recipes.length > 0) {
            await displayRecipes(recipes);
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
        showError(error.message);
    }
}

// Display recipes in the grid
async function displayRecipes(recipes) {
    recipesList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const previewModal = createPreviewModal();

    for (const recipe of recipes) {
        const imageUrl = await getRecipeImage(recipe.title);
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe-card';

        const icon = getRandomIcon();

        recipeElement.innerHTML = `
            <div class="recipe-icon">${icon}</div>
            <img src="${imageUrl}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <p>👥 Servings: ${recipe.servings}</p>
                <p>⭐ Rating: ${(Math.random() * 2 + 3).toFixed(1)}/5</p>
                <button class="preview-btn">Preview Image</button>
            </div>
        `;

        // Add preview functionality
        const previewBtn = recipeElement.querySelector('.preview-btn');
        const modalImg = previewModal.querySelector('img');
        
        previewBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent recipe card click
            modalImg.src = imageUrl;
            previewModal.classList.add('active');
        });

        recipeElement.addEventListener('click', () => showRecipeDetails(recipe, imageUrl));
        fragment.appendChild(recipeElement);
    }

    recipesList.appendChild(fragment);
}

// Show welcome screen with popular categories
function showWelcomeScreen() {
    recipesList.innerHTML = `
        <div class="welcome-screen">
            <h2>Welcome to Kitchen Alchemy! 🧙‍♂️</h2>
            <p>Discover magical recipes from around the world</p>
            
            <div class="popular-categories">
                <h3>Popular Categories</h3>
                <div class="category-grid">
                    ${popularCategories.map(category => `
                        <div class="category-card" onclick="searchRecipes('${category.name}')">
                            <span class="category-emoji">${category.emoji}</span>
                            <span class="category-name">${category.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Show no results message
function showNoResults() {
    recipesList.innerHTML = `
        <div class="welcome-screen">
            <h3>No recipes found 😕</h3>
            <p>Try searching for something else</p>
            
            <div class="popular-categories">
                <h3>Popular Categories</h3>
                <div class="category-grid">
                    ${popularCategories.map(category => `
                        <div class="category-card" onclick="searchRecipes('${category.name}')">
                            <span class="category-emoji">${category.emoji}</span>
                            <span class="category-name">${category.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Show error message
function showError(message) {
    recipesList.innerHTML = `
        <div class="welcome-screen">
            <h3>Oops! Something went wrong 😔</h3>
            <p>Error: ${message}</p>
            <button class="spoon-btn" onclick="searchInput.focus()">Try Again</button>
            
            <div class="popular-categories">
                <h3>Popular Categories</h3>
                <div class="category-grid">
                    ${popularCategories.map(category => `
                        <div class="category-card" onclick="searchRecipes('${category.name}')">
                            <span class="category-emoji">${category.emoji}</span>
                            <span class="category-name">${category.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Display recipe details in modal
function showRecipeDetails(recipe, imageUrl) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);

    const cookingTime = Math.floor(Math.random() * 30) + 30;
    const difficulty = ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)];

    modalContent.innerHTML = `
        <img src="${imageUrl}" alt="${recipe.title}" class="recipe-detail-image">
        <h2>${recipe.title}</h2>
        
        <div class="recipe-meta">
            <p>👥 Servings: ${recipe.servings}</p>
            <p>⏱️ Cooking Time: ${cookingTime} mins</p>
            <p>📊 Difficulty: ${difficulty}</p>
        </div>

        <div class="recipe-section">
            <h3>✨ Ingredients</h3>
            <ul class="ingredients-list">
                ${recipe.ingredients.split('|').map(ing => `
                    <li>
                        <label class="ingredient-item">
                            <input type="checkbox" class="ingredient-checkbox">
                            <span>${ing.trim()}</span>
                        </label>
                    </li>
                `).join('')}
            </ul>
        </div>

        <div class="recipe-section">
            <h3>📝 Instructions</h3>
            <ol class="instructions-list">
                ${formatInstructions(recipe.instructions)}
            </ol>
        </div>

        <div class="recipe-tips">
            <h3>💡 Chef's Tips</h3>
            <ul>
                <li>Prep all ingredients before starting to cook</li>
                <li>Keep an eye on temperature control</li>
                <li>Taste and adjust seasonings as needed</li>
            </ul>
        </div>
    `;

    // Add ingredient checking functionality
    const checkboxes = modalContent.querySelectorAll('.ingredient-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.parentElement;
            if (this.checked) {
                label.classList.add('checked');
            } else {
                label.classList.remove('checked');
            }
        });
    });
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Event Listeners
closeBtn.addEventListener('click', closeModal);

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchRecipes(searchInput.value);
    }
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const previewModal = document.querySelector('.preview-modal');
        if (previewModal && previewModal.classList.contains('active')) {
            previewModal.classList.remove('active');
        } else if (modal.style.display === 'flex') {
            closeModal();
        }
    }
});

// Initialize
addPreviewModalStyles();
showWelcomeScreen();