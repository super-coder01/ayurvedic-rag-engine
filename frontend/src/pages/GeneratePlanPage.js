import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { patientsAPI, dietPlanAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DietPlanDisplay from '../components/DietPlanDisplay';

const GeneratePlanPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');
  
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId || '');
  const [dietitianQuery, setDietitianQuery] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getAll();
      setPatients(response.data.patients || []);
    } catch (error) {
      setError('Failed to fetch patients');
      console.error('Error fetching patients:', error);
    } finally {
      setPatientsLoading(false);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    
    if (!selectedPatientId || !dietitianQuery.trim()) {
      setError('Please select a patient and enter your query');
      return;
    }

    setError('');
    setLoading(true);
    setGeneratedPlan(null);

    try {
      const response = await dietPlanAPI.generate(selectedPatientId, dietitianQuery.trim());
      setGeneratedPlan(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate diet plan');
      console.error('Error generating diet plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p._id === selectedPatientId);

  const sampleQueries = [
    "Create a diet plan to reduce Vata imbalance and improve digestion",
    "Suggest foods to boost energy and reduce stress",
    "Design a cooling diet plan for Pitta constitution",
    "Recommend foods for better sleep and anxiety management",
    "Create a weight management plan following Ayurvedic principles"
  ];

  if (patientsLoading) {
    return <LoadingSpinner message="Loading patients..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ayurveda-primary mb-2">
          🌿 Generate Personalized Diet Plan
        </h1>
        <p className="text-gray-600">
          Use AI-powered Ayurvedic knowledge to create personalized nutrition recommendations
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-semibold text-ayurveda-primary mb-4">
              Plan Configuration
            </h2>

            <form onSubmit={handleGeneratePlan}>
              {/* Patient Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Patient *</label>
                {patients.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">No patients found</p>
                    <Link to="/patients/add" className="btn-primary text-sm">
                      Add First Patient
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} ({patient.age}y, {patient.vikriti})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Patient Info */}
              {selectedPatient && (
                <div className="mb-4 p-3 bg-ayurveda-light rounded-lg">
                  <h3 className="font-medium text-ayurveda-primary">{selectedPatient.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Constitution: {selectedPatient.prakriti}</p>
                    <p>Imbalance: {selectedPatient.vikriti}</p>
                    {selectedPatient.symptoms && selectedPatient.symptoms.length > 0 && (
                      <p>Symptoms: {selectedPatient.symptoms.slice(0, 2).join(', ')}
                        {selectedPatient.symptoms.length > 2 && '...'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Dietitian Query */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Your Query *
                  <span className="text-gray-500 text-xs ml-2">(Be specific about goals)</span>
                </label>
                <textarea
                  value={dietitianQuery}
                  onChange={(e) => setDietitianQuery(e.target.value)}
                  className="input-field"
                  rows="4"
                  placeholder="e.g., Create a diet plan to reduce Vata imbalance and improve digestion for this patient..."
                  required
                />
              </div>

              {/* Sample Queries */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Sample Queries:</label>
                <div className="space-y-1">
                  {sampleQueries.map((query, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setDietitianQuery(query)}
                      className="block w-full text-left text-xs text-ayurveda-primary hover:bg-ayurveda-light p-2 rounded transition-colors"
                    >
                      "{query}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={loading || !selectedPatientId || !dietitianQuery.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating Plan...
                  </div>
                ) : (
                  '🤖 Generate Diet Plan'
                )}
              </button>
            </form>

            {loading && (
              <div className="mt-4 text-center text-sm text-gray-600">
                <p>🧠 Analyzing patient data...</p>
                <p>🌿 Consulting Ayurvedic knowledge...</p>
                <p>📝 Creating personalized plan...</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2">
          {generatedPlan ? (
            <DietPlanDisplay plan={generatedPlan} />
          ) : (
            <div className="card text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Generate Your First Diet Plan?
              </h3>
              <p className="text-gray-500 mb-4">
                Select a patient and describe what kind of diet plan you'd like to create. 
                Our AI will use Ayurvedic principles to generate personalized recommendations.
              </p>
              <div className="text-sm text-gray-400">
                <p>✨ Powered by advanced RAG technology</p>
                <p>📚 Based on traditional Ayurvedic texts</p>
                <p>🎯 Personalized to patient constitution</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratePlanPage;