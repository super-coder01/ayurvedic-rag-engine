const Groq = require('groq-sdk');
const config = require('../config');

class GroqService {
  constructor() {
    this.groq = new Groq({
      apiKey: config.groq.apiKey
    });
  }

  async generateDietPlan(context, query) {
    try {
      const prompt = this.buildPrompt(context, query);
      
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert Ayurvedic dietitian with deep knowledge of traditional Indian medicine and nutrition. Generate personalized diet plans based on patient data, Ayurvedic principles, and available ingredients/recipes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: config.groq.model,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from Groq API');
      }

      return this.parseResponse(response);
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error(`Failed to generate diet plan: ${error.message}`);
    }
  }

  buildPrompt(context, query) {
    const { patient, ingredients, recipes, textChunks } = context;
    
    return `
Based on the following information, generate a personalized Ayurvedic diet plan in **markdown format**:

## PATIENT PROFILE:
- **Name:** ${patient.name}
- **Age:** ${patient.age}
- **Prakriti (Constitution):** ${patient.prakriti}
- **Vikriti (Current Imbalance):** ${patient.vikriti}
- **Symptoms:** ${patient.symptoms?.join(', ') || 'None specified'}
- **Health Goals:** ${patient.healthGoals?.join(', ') || 'General wellness'}

## AVAILABLE INGREDIENTS:
${ingredients.map(ing => `- **${ing.name}:** ${ing.description}`).join('\n')}

## RECOMMENDED RECIPES:
${recipes.map(recipe => `- **${recipe.name}:** ${recipe.description} *(Focus: ${recipe.dosha_focus})*`).join('\n')}

## AYURVEDIC KNOWLEDGE BASE:
${textChunks?.map(chunk => `> ${chunk.text} *(Source: ${chunk.source})*`).join('\n\n') || 'Apply traditional Ayurvedic dietary principles'}

## DIETITIAN QUERY: 
${query}

Please generate a comprehensive diet plan in **markdown format** with the following structure:

# Personalized Ayurvedic Diet Plan for ${patient.name}

## 🎯 Objective
[Brief objective based on patient's needs]

## ⏰ Meal Timing Recommendations
[Ayurvedic meal timing guidelines]

## 🥗 Daily Meal Plan

### Breakfast
[Specific breakfast recommendations]

### Lunch  
[Specific lunch recommendations]

### Dinner
[Specific dinner recommendations]

### Snacks
[Healthy snack options]

## ✅ Foods to Include
[List of beneficial foods with reasons]

## ❌ Foods to Avoid
[List of foods to avoid with reasons]

## 🌿 Lifestyle Recommendations
[Additional lifestyle suggestions]

## 📚 References
[Mention relevant Ayurvedic sources]

Use proper markdown formatting with headers, lists, bold text, and emphasis. Make it comprehensive and actionable.
`;
  }

  parseResponse(response) {
    // For MVP, we'll return the raw response with basic parsing
    // In production, you might want more sophisticated parsing
    const lines = response.split('\n');
    const sourceCitations = [];
    
    // Extract any references mentioned in the response
    lines.forEach(line => {
      if (line.includes('[') && line.includes(']')) {
        const matches = line.match(/\[([^\]]+)\]/g);
        if (matches) {
          sourceCitations.push(...matches.map(m => m.slice(1, -1)));
        }
      }
    });

    return {
      dietPlanText: response,
      sourceCitations: [...new Set(sourceCitations)] // Remove duplicates
    };
  }
}

module.exports = new GroqService();