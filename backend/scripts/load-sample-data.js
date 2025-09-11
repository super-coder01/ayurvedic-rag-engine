const fs = require('fs');
const path = require('path');

// This script loads sample data into our mock system
// In production, this would load data into Cloudant

async function loadSampleData() {
  try {
    console.log('🌿 Loading sample Ayurvedic data...');
    
    // Read sample ingredients
    const ingredientsPath = path.join(__dirname, '../data/sample-ingredients.json');
    const ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'));
    console.log(`✅ Loaded ${ingredients.length} ingredients`);
    
    // Read sample recipes
    const recipesPath = path.join(__dirname, '../data/sample-recipes.json');
    const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
    console.log(`✅ Loaded ${recipes.length} recipes`);
    
    console.log('\n📊 Sample Data Summary:');
    console.log('Ingredients:', ingredients.map(i => i.name).join(', '));
    console.log('Recipes:', recipes.map(r => r.name).join(', '));
    
    console.log('\n🚀 Sample data loaded successfully!');
    console.log('💡 The backend will use this data when Cloudant is not configured.');
    
    return { ingredients, recipes };
  } catch (error) {
    console.error('❌ Error loading sample data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  loadSampleData();
}

module.exports = { loadSampleData };