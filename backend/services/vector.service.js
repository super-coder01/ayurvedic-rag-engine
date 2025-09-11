const fs = require('fs');
const path = require('path');

class VectorService {
  constructor() {
    this.faissIndex = null;
    this.textChunks = [];
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      await this.loadTextChunks();
      // Note: For Node.js, we'll simulate FAISS functionality
      // In production, you'd use a Python service or FAISS Node.js bindings
      console.log('✅ Vector service initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Vector service initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async loadTextChunks() {
    try {
      const textChunksPath = path.join(__dirname, '../data/text_chunks.txt');
      
      if (fs.existsSync(textChunksPath)) {
        const content = fs.readFileSync(textChunksPath, 'utf8');
        
        // Parse text chunks - assuming format: "chunk_text|||source|||metadata"
        this.textChunks = content.split('\n')
          .filter(line => line.trim())
          .map((line, index) => {
            const parts = line.split('|||');
            return {
              id: index,
              text: parts[0] || line,
              source: parts[1] || 'Unknown',
              metadata: parts[2] || ''
            };
          });
        
        console.log(`📚 Loaded ${this.textChunks.length} text chunks`);
      } else {
        console.warn('⚠️  text_chunks.txt not found, using fallback data');
        this.textChunks = this.getFallbackTextChunks();
      }
    } catch (error) {
      console.error('Error loading text chunks:', error);
      this.textChunks = this.getFallbackTextChunks();
    }
  }

  getFallbackTextChunks() {
    return [
      {
        id: 0,
        text: "According to Ayurveda, food should be consumed based on one's constitution (Prakriti) and current imbalances (Vikriti). Vata types benefit from warm, moist, and grounding foods.",
        source: "Charaka Samhita",
        metadata: "dosha_vata"
      },
      {
        id: 1,
        text: "The six tastes (Rasa) - sweet, sour, salty, pungent, bitter, and astringent - should be balanced in every meal according to individual needs.",
        source: "Sushruta Samhita", 
        metadata: "rasa_theory"
      },
      {
        id: 2,
        text: "Proper food combining (Ahara Vidhi) is essential for good digestion. Incompatible food combinations can create toxins (Ama) in the body.",
        source: "Ayurvedic Principles of Nutrition",
        metadata: "food_combining"
      },
      {
        id: 3,
        text: "Pitta dosha governs digestion and metabolism. When imbalanced, it can cause hyperacidity, inflammation, and anger. Cooling foods help balance Pitta.",
        source: "Ashtanga Hridaya",
        metadata: "dosha_pitta"
      },
      {
        id: 4,
        text: "Kapha dosha provides structure and immunity. When excessive, it can cause lethargy and weight gain. Light, warm, and spicy foods help balance Kapha.",
        source: "Charaka Samhita",
        metadata: "dosha_kapha"
      }
    ];
  }

  // Simulate vector similarity search
  async search(query, k = 5) {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      // Simple keyword-based search as fallback
      // In production, this would use actual vector similarity
      const queryLower = query.toLowerCase();
      const scoredChunks = this.textChunks.map(chunk => {
        let score = 0;
        const chunkLower = chunk.text.toLowerCase();
        
        // Simple scoring based on keyword matches
        const queryWords = queryLower.split(' ');
        queryWords.forEach(word => {
          if (chunkLower.includes(word)) {
            score += 1;
          }
        });
        
        // Boost score for dosha-related queries
        if (queryLower.includes('vata') && chunk.metadata.includes('vata')) score += 3;
        if (queryLower.includes('pitta') && chunk.metadata.includes('pitta')) score += 3;
        if (queryLower.includes('kapha') && chunk.metadata.includes('kapha')) score += 3;
        
        return { ...chunk, score };
      });

      // Sort by score and return top k
      const results = scoredChunks
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .filter(chunk => chunk.score > 0);

      console.log(`🔍 Vector search found ${results.length} relevant chunks for query: "${query}"`);
      
      return results.length > 0 ? results : this.textChunks.slice(0, k);
    } catch (error) {
      console.error('Vector search error:', error);
      return this.textChunks.slice(0, k);
    }
  }

  // Method to load FAISS index (placeholder for future implementation)
  async loadFaissIndex() {
    const faissPath = path.join(__dirname, '../data/faiss_index.bin');
    
    if (fs.existsSync(faissPath)) {
      console.log('📦 FAISS index file found at:', faissPath);
      // TODO: Implement actual FAISS loading when Node.js bindings are available
      // For now, we'll use the text-based search above
      return true;
    } else {
      console.warn('⚠️  FAISS index not found, using text-based search');
      return false;
    }
  }
}

module.exports = new VectorService();