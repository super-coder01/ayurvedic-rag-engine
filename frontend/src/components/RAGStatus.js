import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RAGStatus = () => {
  const [ragStatus, setRagStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testQuery, setTestQuery] = useState('vata dosha imbalance digestion');
  const [vectorResults, setVectorResults] = useState(null);

  const testRAGComponents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/rag/test', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRagStatus(response.data);
    } catch (error) {
      console.error('RAG test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testVectorSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/rag/test-vector', 
        { query: testQuery, limit: 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVectorResults(response.data);
    } catch (error) {
      console.error('Vector search test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testRAGComponents();
  }, []);

  if (!ragStatus) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ayurveda-primary"></div>
          <span className="ml-3">Testing RAG components...</span>
        </div>
      </div>
    );
  }

  const { results, summary } = ragStatus;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="card">
        <h2 className="text-xl font-bold text-ayurveda-primary mb-4">
          🔍 RAG System Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-800 font-semibold">All Components</div>
            <div className="text-2xl font-bold text-green-600">
              {summary.allComponentsWorking ? '✅' : '❌'}
            </div>
            <div className="text-sm text-green-600">
              {summary.allComponentsWorking ? 'Working' : 'Issues Found'}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-800 font-semibold">Custom Data</div>
            <div className="text-2xl font-bold text-blue-600">
              {summary.usingCustomData ? '📁' : '📋'}
            </div>
            <div className="text-sm text-blue-600">
              {summary.usingCustomData ? 'Your Files' : 'Sample Data'}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-800 font-semibold">Vector Search</div>
            <div className="text-2xl font-bold text-purple-600">
              {summary.vectorSearchReady ? '🔍' : '❌'}
            </div>
            <div className="text-sm text-purple-600">
              {summary.vectorSearchReady ? 'Ready' : 'Not Ready'}
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-orange-800 font-semibold">Data Sources</div>
            <div className="text-2xl font-bold text-orange-600">
              {summary.totalDataSources}/4
            </div>
            <div className="text-sm text-orange-600">Files Found</div>
          </div>
        </div>

        <button
          onClick={testRAGComponents}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Testing...' : '🔄 Refresh Test'}
        </button>
      </div>

      {/* Component Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vector Service */}
        <div className="card">
          <h3 className="text-lg font-semibold text-ayurveda-primary mb-3">
            📚 Vector Service
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-green-600">
                {results.components.vectorService?.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Results:</span>
              <span>{results.components.vectorService?.resultsCount}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                className="input-field flex-1 text-sm"
                placeholder="Test vector search..."
              />
              <button
                onClick={testVectorSearch}
                className="bg-ayurveda-accent text-white px-3 py-1 rounded text-sm"
              >
                Test
              </button>
            </div>
            
            {vectorResults && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-semibold mb-2">
                  Found {vectorResults.resultsCount} results:
                </div>
                {vectorResults.results.slice(0, 2).map((result, i) => (
                  <div key={i} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                    <div className="text-xs text-gray-500">
                      Score: {result.score || 'N/A'} | Source: {result.source}
                    </div>
                    <div className="text-xs">
                      {result.text.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ingredients Database */}
        <div className="card">
          <h3 className="text-lg font-semibold text-ayurveda-primary mb-3">
            🌿 Ingredients Database
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Ingredients:</span>
              <span className="font-semibold">
                {results.components.ingredientsDB?.totalIngredients}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Vata Balancing:</span>
              <span>{results.components.ingredientsDB?.vataBalancingIngredients}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Sample Ingredients:</div>
            <div className="space-y-1">
              {results.components.ingredientsDB?.sampleIngredients?.map((ing, i) => (
                <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="font-medium">{ing.name}</div>
                  <div className="text-gray-600">
                    Vata: {ing.doshaEffects?.vata || 'N/A'} | 
                    Pitta: {ing.doshaEffects?.pitta || 'N/A'} | 
                    Kapha: {ing.doshaEffects?.kapha || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recipes Database */}
        <div className="card">
          <h3 className="text-lg font-semibold text-ayurveda-primary mb-3">
            🍽️ Recipes Database
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Recipes:</span>
              <span className="font-semibold">
                {results.components.recipesDB?.totalRecipes}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Vata Recipes:</span>
              <span>{results.components.recipesDB?.vataRecipes}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Sample Recipes:</div>
            <div className="space-y-1">
              {results.components.recipesDB?.sampleRecipes?.map((recipe, i) => (
                <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="font-medium">{recipe.name}</div>
                  <div className="text-gray-600">Focus: {recipe.doshaFocus}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Files Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-ayurveda-primary mb-3">
            📁 Data Files
          </h3>
          <div className="space-y-2">
            {Object.entries(results.components.dataFiles || {}).map(([filename, status]) => (
              <div key={filename} className="flex justify-between items-center">
                <span className="text-sm">{filename}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${status.exists ? 'text-green-600' : 'text-red-600'}`}>
                    {status.exists ? '✅' : '❌'}
                  </span>
                  {status.exists && (
                    <span className="text-xs text-gray-500">{status.size}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
            <div className="font-semibold text-blue-800 mb-1">💡 Tip:</div>
            <div className="text-blue-700">
              Place your data files in <code>backend/data/</code> to use custom data instead of samples.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAGStatus;