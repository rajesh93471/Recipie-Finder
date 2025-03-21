// -----------------------------
// Existing Code for Recipe Cards
// -----------------------------
const recipeCards = document.querySelectorAll('.recipe-card');
const modal = document.getElementById('recipeModal');
const modalTitle = document.getElementById('modalRecipeTitle');
const modalIngredients = document.getElementById('modalRecipeIngredients');
const modalInstructions = document.getElementById('modalRecipeInstructions');
const closeBtn = document.querySelector('.close');

/**
 * Opens the main recipe modal with provided data.
 * Also adds a "View Recipe Image" button which, when clicked, opens a second modal to display the image.
 *
 * @param {Object} recipe - The recipe object.
 * @param {string} recipe.title - Recipe title.
 * @param {Array|string} recipe.ingredients - Recipe ingredients.
 * @param {string} recipe.instructions - Recipe instructions.
 */
function openModal({ title, ingredients, instructions }) {
  modalTitle.textContent = title || "No Title";

  // Convert pipe-delimited ingredients to comma-separated if needed.
  if (typeof ingredients === "string" && ingredients.includes("|")) {
    ingredients = ingredients.split("|").join(", ");
  }
  if (Array.isArray(ingredients)) {
    ingredients = ingredients.join(", ");
  }
  modalIngredients.textContent = "Ingredients: " + ingredients;

  // Format instructions: if plain text (no HTML tags), insert line breaks.
  if (instructions && !instructions.includes("<")) {
    instructions = instructions.replace(/\. /g, ".<br>");
  }
  modalInstructions.innerHTML = `<p>${instructions || "No instructions available."}</p>`;

  // Add (or update) the "View Recipe Image" button in the modal.
  let viewImageBtn = document.getElementById("viewImageBtn");
  if (!viewImageBtn) {
    viewImageBtn = document.createElement("button");
    viewImageBtn.id = "viewImageBtn";
    viewImageBtn.textContent = "View Recipe Image";
    viewImageBtn.className = "btn";
    // Append the button at the end of the modal content.
    document.querySelector('.modal-content').appendChild(viewImageBtn);
  } else {
    viewImageBtn.style.display = "inline-block";
  }
  // Set the button's click to fetch and display the image.
  viewImageBtn.onclick = function() {
    fetchRecipeImage(title);
  };

  modal.style.display = "block";

  // Fetch nutritional data immediately.
  fetchNutritionData(title, ingredients);
}

// Existing event listener for recipe cards.
recipeCards.forEach(card => {
  card.addEventListener('click', () => {
    const title = card.dataset.recipeTitle;
    const ingredients = card.dataset.recipeIngredients;
    const rawInstructions = card.dataset.recipeInstructions;

    // Process instructions stored as HTML in the data attribute.
    const instructionsParts = rawInstructions.split("<h3>Instructions:</h3>");
    let instructions = "No instructions available.";
    if (instructionsParts.length > 1) {
      const steps = instructionsParts[1].split("</p>").filter(step => step.trim() !== "");
      instructions = steps.map(step => step.trim() + "</p>").join("");
    }
    
    openModal({
      title: title,
      ingredients: ingredients,
      instructions: instructions
    });
  });
});

// Close modal when clicking the close button.
closeBtn.onclick = function() {
  modal.style.display = "none";
};

// Close modal when clicking outside the modal content.
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// -----------------------------
// New Code: Search Integration using API Ninjas Recipe API
// -----------------------------
const searchBar = document.querySelector('.search-bar');

searchBar.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    let query = searchBar.value.trim();
    if (query !== "") {
      fetchRecipeBySearch(query);
    }
  }
});

/**
 * Fetches recipe data using API Ninjas.
 * If query is "test", uses a hardcoded test recipe.
 *
 * @param {string} query - The search term.
 */
function fetchRecipeBySearch(query) {
  if (query.toLowerCase() === "test") {
    const testRecipe = {
      title: "Stracciatella (Italian Wedding Soup)",
      ingredients: "3 1/2 c Chicken broth; homemade|1 lb Fresh spinach; wash/trim/chop|1 Egg|1 c Grated parmesan cheese; --or--|1 c Romano cheese; freshly grated|Salt and pepper; to taste",
      instructions: "Bring 1 cup of the broth to a boil. Add spinach and cook until softened but still bright green. Remove spinach with a slotted spoon and set aside. Add remaining broth to pot. Bring to a boil. Meanwhile, beat egg lightly with a fork. Beat in 1/4 cup of cheese. When broth boils pour in egg mixture, stirring constantly for a few seconds until it cooks into \"rags.\" Add reserved spinach, salt and pepper. Serve immediately, passing remaining cheese. NOTES: Someone asked for this recipe a while back. I believe this soup, known as \"Stracciatella\" is synonymous with Italian Wedding Soup, however, I seem to remember from I-don't-know-where that Italian Wedding Soup is the same as this but with the addition of tiny meatballs."
    };
    openModal(testRecipe);
    return;
  }

  const apiKey = "YOUR_API_NINJAS_API_KEY"; // Replace with your API Ninjas key.
  const url = `https://api.api-ninjas.com/v1/recipe?query=${encodeURIComponent(query)}`;

  fetch(url, {
    method: 'GET',
    headers: { 'X-Api-Key': apiKey }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    })
    .then(data => {
      if (data.length > 0) {
        const recipe = data[0];
        openModal({
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions
        });
      } else {
        alert("No recipes found for your query.");
      }
    })
    .catch(error => {
      console.error("Error fetching recipe from API Ninjas:", error);
      alert("Error fetching recipe data.");
    });
}

// -----------------------------
// New Code: Nutritional Values & Recipe Image Integration
// -----------------------------

/**
 * Fetches nutritional details using the Edamam Nutrition Analysis API.
 * For the test recipe (Stracciatella), random nutritional data is shown.
 *
 * @param {string} recipeTitle - The recipe title.
 * @param {string} ingredients - Comma-separated ingredients.
 */
function fetchNutritionData(recipeTitle, ingredients) {
  // For test recipe, display random nutritional data.
  if (recipeTitle.toLowerCase().includes("stracciatella")) {
    let randomData = {
      calories: Math.floor(Math.random() * 500) + 100,
      protein: (Math.random() * 30).toFixed(1) + "g",
      fat: (Math.random() * 30).toFixed(1) + "g",
      carbohydrates: (Math.random() * 50).toFixed(1) + "g"
    };
    document.querySelector('.nutrition-box').innerHTML = `<pre>${JSON.stringify(randomData, null, 2)}</pre>`;
    return;
  }

  const appId = "YOUR_EDAMAM_APP_ID";    // Replace with your Edamam App ID.
  const appKey = "YOUR_EDAMAM_APP_KEY";    // Replace with your Edamam App Key.
  const url = `https://api.edamam.com/api/nutrition-details?app_id=${appId}&app_key=${appKey}`;

  const ingredientArray = ingredients.split(",").map(item => item.trim());
  const payload = {
    title: recipeTitle,
    ingr: ingredientArray
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    document.querySelector('.nutrition-box').innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  })
  .catch(error => {
    console.error("Error fetching nutrition data:", error);
  });
}

/**
 * Fetches a recipe image using the Unsplash API.
 * When called, it opens an image modal displaying the image.
 *
 * @param {string} recipeTitle - The recipe title to use as a search query.
 */
function fetchRecipeImage(recipeTitle) {
  const clientId = "YOUR_UNSPLASH_CLIENT_ID"; // Replace with your Unsplash Client ID.
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(recipeTitle)}&client_id=${clientId}&per_page=1`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const imageUrl = data.results[0].urls.regular;
        openImageModal(imageUrl);
      } else {
        alert("No image found for this recipe.");
      }
    })
    .catch(error => console.error("Error fetching recipe image:", error));
}

/**
 * Opens a new modal popup to display the recipe image.
 *
 * @param {string} imageUrl - The URL of the image.
 */
function openImageModal(imageUrl) {
  let imageModal = document.getElementById("imageModal");
  if (!imageModal) {
    // Create the image modal dynamically.
    imageModal = document.createElement("div");
    imageModal.id = "imageModal";
    imageModal.className = "modal";
    imageModal.innerHTML = `
      <div class="modal-content">
        <span class="close-image" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
        <img id="recipeImageDisplay" src="" alt="Recipe Image" style="max-width: 100%; display: block; margin: 0 auto;">
      </div>
    `;
    document.body.appendChild(imageModal);
    
    // Add close event for the image modal.
    imageModal.querySelector(".close-image").onclick = function() {
      imageModal.style.display = "none";
    };
    window.addEventListener("click", function(event) {
      if (event.target == imageModal) {
        imageModal.style.display = "none";
      }
    });
  }
  document.getElementById("recipeImageDisplay").src = imageUrl;
  imageModal.style.display = "block";
}
