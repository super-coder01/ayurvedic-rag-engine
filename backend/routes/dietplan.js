const express = require('express');
const storageService = require('../services/storage.service');
const groqService = require('../services/groq.service');
const vectorService = require('../services/vector.service');
const authMiddleware = require('../middleware/auth');
const logger = require('../services/logger.service');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Generate diet plan - The core RAG functionality
router.post('/generate', async (req, res) => {
  try {
    const { patientId, dietitianQuery } = req.body;

    // Validation
    if (!patientId || !dietitianQuery) {
      return res.status(400).json({ 
        error: 'Patient ID and dietitian query are required' 
      });
    }

    logger.info('RAG PIPELINE STARTED', { patientId, query: dietitianQuery });

    // Step 1: Get patient data
    logger.info('STEP 1: Retrieving Patient Data');
    const patient = await storageService.get('patients', patientId);
    if (!patient) {
      logger.error('Patient not found', { patientId });
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Ensure the patient belongs to the authenticated dietitian
    if (patient.dietitianId !== req.user.userId) {
      logger.warning('Access denied - Patient ownership mismatch', { 
        patientId, 
        patientDietitianId: patient.dietitianId, 
        requestUserId: req.user.userId 
      });
      return res.status(403).json({ error: 'Access denied' });
    }

    logger.success('Patient data retrieved', {
      name: patient.name,
      age: patient.age,
      prakriti: patient.prakriti,
      vikriti: patient.vikriti,
      symptoms: patient.symptoms,
      goals: patient.healthGoals
    });

    // Step 2: Get relevant ingredients based on patient's dosha
    logger.info('STEP 2: Retrieving Relevant Ingredients');
    const ingredients = await getRelevantIngredients(patient);
    logger.success(`Found ${ingredients.length} relevant ingredients`, {
      count: ingredients.length,
      doshaFocus: patient.vikriti,
      ingredients: ingredients.slice(0, 5).map(ing => ({
        name: ing.name,
        effect: ing.ayurvedicProperties?.dosha_effects?.[patient.vikriti.toLowerCase()]
      }))
    });

    // Step 3: Get relevant recipes based on patient's dosha
    logger.info('STEP 3: Retrieving Relevant Recipes');
    const recipes = await getRelevantRecipes(patient);
    logger.success(`Found ${recipes.length} relevant recipes`, {
      count: recipes.length,
      recipes: recipes.map(recipe => ({
        name: recipe.name,
        focus: recipe.dosha_focus
      }))
    });

    // Step 4: Get relevant text chunks using vector search
    logger.info('STEP 4: Vector Search for Knowledge Chunks');
    const textChunks = await vectorService.search(dietitianQuery, 5);
    logger.success(`Found ${textChunks.length} relevant knowledge chunks`, {
      count: textChunks.length,
      query: dietitianQuery,
      chunks: textChunks.map(chunk => ({
        preview: chunk.text.substring(0, 100),
        source: chunk.source,
        score: chunk.score
      }))
    });

    // Step 5: Prepare context for Groq
    const context = {
      patient,
      ingredients,
      recipes,
      textChunks
    };

    logger.info('STEP 5: Generating Diet Plan with AI');
    const contextSize = JSON.stringify(context).length;
    logger.info('Context prepared for AI', {
      contextSizeKB: (contextSize / 1024).toFixed(1),
      ingredients: ingredients.length,
      recipes: recipes.length,
      knowledgeChunks: textChunks.length
    });

    // Step 6: Generate diet plan using Groq
    const result = await groqService.generateDietPlan(context, dietitianQuery);

    logger.success('Diet plan generated successfully', {
      planLength: result.dietPlanText.length,
      sourceCitations: result.sourceCitations.length,
      patientName: patient.name
    });

    res.json({
      message: 'Diet plan generated successfully',
      dietPlan: result.dietPlanText,
      sourceCitations: result.sourceCitations,
      metadata: {
        patientName: patient.name,
        generatedAt: new Date().toISOString(),
        ingredientsUsed: ingredients.length,
        recipesUsed: recipes.length
      }
    });

  } catch (error) {
    console.error('Error generating diet plan:', error);
    res.status(500).json({ 
      error: 'Failed to generate diet plan',
      details: error.message 
    });
  }
});

// Helper function to get relevant ingredients
async function getRelevantIngredients(patient) {
  try {
    // For MVP, get ingredients that balance the patient's vikriti (imbalance)
    const allIngredients = await storageService.find('ingredients', {});
    
    // Filter ingredients that help balance the patient's vikriti
    const relevantIngredients = allIngredients.filter(ingredient => {
      const doshaEffects = ingredient.ayurvedicProperties?.dosha_effects;
      if (!doshaEffects) return false;
      
      const vikriti = patient.vikriti.toLowerCase();
      return doshaEffects[vikriti] === 'reduces' || doshaEffects[vikriti] === 'balances';
    });

    return relevantIngredients.slice(0, 10); // Limit to top 10 for MVP
  } catch (error) {
    console.error('Error getting ingredients:', error);
    return [];
  }
}

// Helper function to get relevant recipes
async function getRelevantRecipes(patient) {
  try {
    // For MVP, get recipes that focus on balancing the patient's vikriti
    const allRecipes = await storageService.find('recipes', {});
    
    const relevantRecipes = allRecipes.filter(recipe => {
      const doshaFocus = recipe.dosha_focus?.toLowerCase();
      const vikriti = patient.vikriti.toLowerCase();
      return doshaFocus === vikriti || doshaFocus === 'all' || doshaFocus === 'general';
    });

    return relevantRecipes.slice(0, 5); // Limit to top 5 for MVP
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
}

// Note: getRelevantTextChunks function removed - now using vectorService.search directly

module.exports = router;