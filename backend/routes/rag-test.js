const express = require('express');
const storageService = require('../services/storage.service');
const vectorService = require('../services/vector.service');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Test RAG components individually
router.get('/test', authMiddleware, async (req, res) => {
  try {
    console.log('\n🧪 ===== RAG COMPONENT TEST =====');

    const testResults = {
      timestamp: new Date().toISOString(),
      components: {}
    };

    // Test 1: Vector Service
    console.log('\n1️⃣ Testing Vector Service...');
    const testQuery = 'vata dosha imbalance digestion';
    const vectorResults = await vectorService.search(testQuery, 3);

    testResults.components.vectorService = {
      status: 'working',
      query: testQuery,
      resultsCount: vectorResults.length,
      results: vectorResults.map(r => ({
        text: r.text.substring(0, 100) + '...',
        source: r.source,
        score: r.score || 'N/A'
      }))
    };
    console.log(`✅ Vector search returned ${vectorResults.length} results`);

    // Test 2: Ingredients Database
    console.log('\n2️⃣ Testing Ingredients Database...');
    const allIngredients = await storageService.find('ingredients', {});
    const vataIngredients = allIngredients.filter(ing =>
      ing.ayurvedicProperties?.dosha_effects?.vata === 'reduces' ||
      ing.ayurvedicProperties?.dosha_effects?.vata === 'balances'
    );

    testResults.components.ingredientsDB = {
      status: 'working',
      totalIngredients: allIngredients.length,
      vataBalancingIngredients: vataIngredients.length,
      sampleIngredients: allIngredients.slice(0, 3).map(ing => ({
        name: ing.name,
        doshaEffects: ing.ayurvedicProperties?.dosha_effects
      }))
    };
    console.log(`✅ Ingredients DB: ${allIngredients.length} total, ${vataIngredients.length} for Vata`);

    // Test 3: Recipes Database
    console.log('\n3️⃣ Testing Recipes Database...');
    const allRecipes = await storageService.find('recipes', {});
    const vataRecipes = allRecipes.filter(recipe =>
      recipe.dosha_focus?.toLowerCase().includes('vata')
    );

    testResults.components.recipesDB = {
      status: 'working',
      totalRecipes: allRecipes.length,
      vataRecipes: vataRecipes.length,
      sampleRecipes: allRecipes.slice(0, 3).map(recipe => ({
        name: recipe.name,
        doshaFocus: recipe.dosha_focus
      }))
    };
    console.log(`✅ Recipes DB: ${allRecipes.length} total, ${vataRecipes.length} for Vata`);

    // Test 4: Data Sources Detection
    console.log('\n4️⃣ Detecting Data Sources...');
    const fs = require('fs');
    const path = require('path');

    const dataFiles = [
      'faiss_index.bin',
      'text_chunks.txt',
      'ingredients.json',
      'recipes.json'
    ];

    const dataStatus = {};
    dataFiles.forEach(filename => {
      const filePath = path.join(__dirname, '../data', filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        dataStatus[filename] = {
          exists: true,
          size: `${(stats.size / 1024).toFixed(1)} KB`,
          modified: stats.mtime.toISOString()
        };
      } else {
        dataStatus[filename] = { exists: false };
      }
    });

    testResults.components.dataFiles = dataStatus;

    // Test 5: RAG Pipeline Simulation
    console.log('\n5️⃣ Simulating RAG Pipeline...');
    const mockPatient = {
      name: 'Test Patient',
      vikriti: 'Vata',
      prakriti: 'Vata-Pitta'
    };

    const mockQuery = 'Create a diet plan to reduce Vata imbalance';

    // Simulate the full pipeline
    const pipelineResults = {
      patient: mockPatient,
      relevantIngredients: vataIngredients.slice(0, 5),
      relevantRecipes: vataRecipes.slice(0, 3),
      knowledgeChunks: vectorResults,
      contextSize: 0
    };

    // Calculate context size
    const contextText = JSON.stringify(pipelineResults);
    pipelineResults.contextSize = contextText.length;

    testResults.components.ragPipeline = {
      status: 'working',
      contextSize: `${(contextText.length / 1024).toFixed(1)} KB`,
      componentsReady: {
        patientData: true,
        ingredients: pipelineResults.relevantIngredients.length > 0,
        recipes: pipelineResults.relevantRecipes.length > 0,
        knowledge: pipelineResults.knowledgeChunks.length > 0
      }
    };

    console.log(`✅ RAG Pipeline simulation complete`);
    console.log(`📊 Context size: ${(contextText.length / 1024).toFixed(1)} KB`);
    console.log(`🔍 ===== RAG TEST COMPLETED =====\n`);

    res.json({
      message: 'RAG components test completed',
      results: testResults,
      summary: {
        allComponentsWorking: Object.values(testResults.components).every(c => c.status === 'working'),
        usingCustomData: dataStatus['ingredients.json']?.exists && dataStatus['recipes.json']?.exists,
        vectorSearchReady: vectorResults.length > 0,
        totalDataSources: Object.values(dataStatus).filter(f => f.exists).length
      }
    });

  } catch (error) {
    console.error('❌ RAG test failed:', error);
    res.status(500).json({
      error: 'RAG test failed',
      details: error.message
    });
  }
});

// Test specific vector search
router.post('/test-vector', authMiddleware, async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`\n🔍 Testing vector search for: "${query}"`);

    const results = await vectorService.search(query, limit);

    console.log(`✅ Found ${results.length} results`);
    results.forEach((result, i) => {
      console.log(`${i + 1}. Score: ${result.score || 'N/A'} | Source: ${result.source}`);
      console.log(`   Text: ${result.text.substring(0, 100)}...`);
    });

    res.json({
      query,
      resultsCount: results.length,
      results: results.map(r => ({
        text: r.text,
        source: r.source,
        score: r.score,
        metadata: r.metadata
      }))
    });

  } catch (error) {
    console.error('❌ Vector search test failed:', error);
    res.status(500).json({
      error: 'Vector search test failed',
      details: error.message
    });
  }
});

module.exports = router;