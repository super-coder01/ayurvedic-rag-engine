const fs = require('fs');
const path = require('path');

function setupDataFiles() {
  console.log('🔧 Setting up data files for RAG system...\n');
  
  const dataDir = path.join(__dirname, '..', 'backend', 'data');
  const expectedFiles = [
    'faiss_index.bin',
    'text_chunks.txt', 
    'recipes.json',
    'ingredients.json'
  ];
  
  console.log('📁 Checking data directory:', dataDir);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory');
  }
  
  console.log('\n📄 Checking for your data files:');
  
  expectedFiles.forEach(filename => {
    const filePath = path.join(dataDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${filename} - Found (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`❌ ${filename} - Not found`);
    }
  });
  
  console.log('\n📋 Instructions:');
  console.log('1. Copy your data files to: backend/data/');
  console.log('2. Expected files:');
  expectedFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  
  console.log('\n🚀 Once files are in place:');
  console.log('   - Restart the backend server');
  console.log('   - Check console logs for "Loaded X ingredients/recipes"');
  console.log('   - The RAG system will use your actual data');
  
  console.log('\n💡 Current status:');
  console.log('   - System works with sample data as fallback');
  console.log('   - Vector search uses keyword matching (fallback)');
  console.log('   - Ready for your FAISS index and real data');
}

setupDataFiles();