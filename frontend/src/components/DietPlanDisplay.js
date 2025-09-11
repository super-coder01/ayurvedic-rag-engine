import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const DietPlanDisplay = ({ plan }) => {
  const [activeTab, setActiveTab] = useState('plan');

  if (!plan) return null;

  const { dietPlan, sourceCitations, metadata } = plan;

  // Custom markdown components for better styling
  const markdownComponents = {
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold text-ayurveda-primary mt-8 mb-4 border-b-2 border-ayurveda-accent pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-semibold text-ayurveda-primary mt-6 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-medium text-ayurveda-secondary mt-4 mb-2">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-700 mb-4 leading-relaxed">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 ml-4">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-gray-700">
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-ayurveda-primary">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-ayurveda-secondary">
        {children}
      </em>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-ayurveda-accent bg-ayurveda-light pl-4 py-2 mb-4 italic">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
        {children}
      </pre>
    )
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dietPlan);
    // You could add a toast notification here
  };

  const downloadPlan = () => {
    const element = document.createElement('a');
    const file = new Blob([dietPlan], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `diet-plan-${metadata?.patientName?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-ayurveda-primary mb-2">
            🌿 Personalized Diet Plan
          </h2>
          {metadata && (
            <div className="text-sm text-gray-600">
              <p>Patient: <span className="font-medium">{metadata.patientName}</span></p>
              <p>Generated: {new Date(metadata.generatedAt).toLocaleString()}</p>
              <p>Based on {metadata.ingredientsUsed} ingredients and {metadata.recipesUsed} recipes</p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={copyToClipboard}
            className="bg-ayurveda-accent text-white px-3 py-2 rounded text-sm hover:bg-ayurveda-secondary transition-colors"
            title="Copy to clipboard"
          >
            📋 Copy
          </button>
          <button
            onClick={downloadPlan}
            className="bg-ayurveda-secondary text-white px-3 py-2 rounded text-sm hover:bg-ayurveda-primary transition-colors"
            title="Download as text file"
          >
            💾 Download
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('plan')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plan'
                ? 'border-ayurveda-primary text-ayurveda-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Diet Plan
          </button>
          {sourceCitations && sourceCitations.length > 0 && (
            <button
              onClick={() => setActiveTab('sources')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sources'
                  ? 'border-ayurveda-primary text-ayurveda-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sources ({sourceCitations.length})
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'plan' && (
        <div className="prose max-w-none">
          <div className="bg-gradient-to-r from-ayurveda-light to-white p-4 rounded-lg mb-6">
            <div className="flex items-center text-ayurveda-primary mb-2">
              <span className="text-lg">🤖</span>
              <span className="ml-2 font-medium">AI-Generated Ayurvedic Recommendations</span>
            </div>
            <p className="text-sm text-gray-600">
              This plan is generated using traditional Ayurvedic principles combined with modern AI. 
              Please consult with a qualified practitioner before making significant dietary changes.
            </p>
          </div>
          
          <div className="diet-plan-content">
            <ReactMarkdown components={markdownComponents}>
              {dietPlan}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {activeTab === 'sources' && sourceCitations && (
        <div>
          <h3 className="text-lg font-semibold text-ayurveda-primary mb-4">
            📚 Knowledge Sources
          </h3>
          {sourceCitations.length > 0 ? (
            <div className="space-y-3">
              {sourceCitations.map((citation, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <span className="bg-ayurveda-primary text-white text-xs px-2 py-1 rounded mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <p className="text-sm text-gray-700">{citation}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No specific sources cited in this plan.</p>
          )}
          
          <div className="mt-6 p-4 bg-ayurveda-light rounded-lg">
            <h4 className="font-medium text-ayurveda-primary mb-2">General Knowledge Base:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Traditional Ayurvedic texts (Charaka Samhita, Sushruta Samhita)</li>
              <li>• Modern research on Ayurvedic nutrition</li>
              <li>• Curated ingredient and recipe database</li>
              <li>• Dosha-specific dietary guidelines</li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            Plan generated successfully using RAG technology
          </div>
          <div className="text-xs">
            Powered by Groq AI • Ayurvedic Knowledge Base
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlanDisplay;