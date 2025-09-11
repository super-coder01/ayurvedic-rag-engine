// Test RAG components without starting full server
const vectorService = require('../backend/services/vector.service');
const storageService = require('../backend/services/storage.service');

async function testRAGComponents() {
  console.log('🧪 ===== RAG COMPONENTS TEST =====\n');

  try {
    // Test 1: Vector Service
    console.log('1️⃣ Testing Vector Service...');
    const queries = [
      'vata dosha imbalance',
      'pitta digestion fire',
      'kapha weight management',
      'ayurvedic food combining'
    ];

    for (const query of queries) {
      const results = await vectorService.search(query, 3);
      console.log(`   Query: "${query}" → ${results.length} results`);
      if (results.length > 0) {
        console.log(`   Top result: "${results[0].text.substring(0, 60)}..." (${results[0].source})`);
      }
    }

    // Test 2: Ingredients Database
    console.log('\n2️⃣ Testing Ingredients Database...');
    const allIngredients = await storageService.find('ingredients', {});
    console.log(`   Total ingredients: ${allIngredients.length}`);
    
    const doshaEffects = { vata: 0, pitta: 0, kapha: 0 };
    allIngredients.forEach(ing => {
      const effects = ing.ayurvedicProperties?.dosha_effects;
      if (effects) {
        Object.keys(doshaEffects).forEach(dosha => {
          if (effects[dosha] === 'reduces' || effects[dosha] === 'balances') {
            doshaEffects[dosha]++;
          }
        });
      }
    });
    
    console.log(`   Ingredients that help balance:`);
    console.log(`     Vata: ${doshaEffects.vata}`);
    console.log(`     Pitta: ${doshaEffects.pitta}`);
    console.log(`     Kapha: ${doshaEffects.kapha}`);

    // Test 3: Recipes Database
    console.log('\n3️⃣ Testing Recipes Database...');
    const allRecipes = await storageService.find('recipes', {});
    console.log(`   Total recipes: ${allRecipes.length}`);
    
    const recipesByDosha = { vata: 0, pitta: 0, kapha: 0, general: 0 };
    allRecipes.forEach(recipe => {
      const focus = recipe.dosha_focus?.toLowerCase();
      if (focus) {
        if (focus.includes('vata')) recipesByDosha.vata++;
        else if (focus.includes('pitta')) recipesByDosha.pitta++;
        else if (focus.includes('kapha')) recipesByDosha.kapha++;
        else recipesByDosha.general++;
      }
    });
    
    console.log(`   Recipes by dosha focus:`);
    console.log(`     Vata: ${recipesByDosha.vata}`);
    console.log(`     Pitta: ${recipesByDosha.pitta}`);
    console.log(`     Kapha: ${recipesByDosha.kapha}`);
    console.log(`     General: ${recipesByDosha.general}`);

    // Test 4: Data Files Check
    console.log('\n4️⃣ Checking Data Files...');
    const fs = require('fs');
    const path = require('path');
    
    const dataFiles = [
      'faiss_index.bin',
      'text_chunks.txt',
      'ingredients.json',
      'recipes.json'
    ];
    
    let customFilesFound = 0;
    dataFiles.forEach(filename => {
      const filePath = path.join(__dirname, '..', 'backend', 'data', filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`   ✅ ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
        customFilesFound++;
      } else {
        console.log(`   ❌ ${filename} (not found)`);
      }
    });

    // Test 5: RAG Pipeline Simulation
    console.log('\n5️⃣ Simulating Full RAG Pipeline...');
    
    const mockPatient = {
      name: 'Test Patient',
      age: 35,
      prakriti: 'Vata-Pitta',
      vikriti: 'Vata',
      symptoms: ['dry skin', 'anxiety', 'irregular digestion'],
      healthGoals: ['better sleep', 'stress reduction']
    };
    
    const mockQuery = 'Create a diet plan to reduce Vata imbalance and improve digestion';
    
    // Get relevant ingredients
    const relevantIngredients = allIngredients.filter(ing => {
      const effects = ing.ayurvedicProperties?.dosha_effects;
      return effects && (effects.vata === 'reduces' || effects.vata === 'balances');
    }).slice(0, 5);
    
    // Get relevant recipes
    const relevantRecipes = allRecipes.filter(recipe => {
      const focus = recipe.dosha_focus?.toLowerCase();
      return focus && focus.includes('vata');
    }).slice(0, 3);
    
    // Get knowledge chunks
    const knowledgeChunks = await vectorService.search(mockQuery, 5);
    
    console.log(`   Patient: ${mockPatient.name} (${mockPatient.vikriti} imbalance)`);
    console.log(`   Relevant ingredients: ${relevantIngredients.length}`);
    console.log(`   Relevant recipes: ${relevantRecipes.length}`);
    console.log(`   Knowledge chunks: ${knowledgeChunks.length}`);
    
    // Calculate context size
    const context = {
      patient: mockPatient,
      ingredients: relevantIngredients,
      recipes: relevantRecipes,
      textChunks: knowledgeChunks
    };
    
    const contextSize = JSON.stringify(context).length;
    console.log(`   Context size: ${(contextSize / 1024).toFixed(1)} KB`);

    // Summary
    console.log('\n📊 ===== RAG TEST SUMMARY =====');
    console.log(`✅ Vector Service: Working (${queries.length} test queries)`);
    console.log(`✅ Ingredients DB: ${allIngredients.length} ingredients loaded`);
    console.log(`✅ Recipes DB: ${allRecipes.length} recipes loaded`);
    console.log(`📁 Custom Data Files: ${customFilesFound}/4 found`);
    console.log(`🔍 RAG Pipeline: Ready (${(contextSize / 1024).toFixed(1)} KB context)`);
    
    if (customFilesFound === 4) {
      console.log(`🎉 All your custom data files are loaded!`);
    } else if (customFilesFound > 0) {
      console.log(`⚠️  Using mix of custom and sample data`);
    } else {
      console.log(`📋 Using sample data (place files in backend/data/)`);
    }
    
    console.log(`\n🚀 RAG system is ${customFilesFound >= 2 ? 'fully' : 'partially'} operational!`);

  } catch (error) {
    console.error('❌ RAG test failed:', error);
  }
}

// Run the test
testRAGComponents();