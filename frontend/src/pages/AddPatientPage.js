import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientsAPI } from '../services/api';

const AddPatientPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    prakriti: '',
    vikriti: '',
    symptoms: '',
    healthGoals: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const doshaOptions = [
    'Vata',
    'Pitta', 
    'Kapha',
    'Vata-Pitta',
    'Vata-Kapha',
    'Pitta-Kapha',
    'Tridoshic'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : [],
        healthGoals: formData.healthGoals ? formData.healthGoals.split(',').map(g => g.trim()) : []
      };

      await patientsAPI.create(patientData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6 text-ayurveda-primary">
          Add New Patient
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Patient Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="input-field"
                min="1"
                max="120"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prakriti (Constitution) *</label>
              <select
                name="prakriti"
                value={formData.prakriti}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Prakriti</option>
                {doshaOptions.map(dosha => (
                  <option key={dosha} value={dosha}>{dosha}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vikriti (Current Imbalance) *</label>
              <select
                name="vikriti"
                value={formData.vikriti}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Vikriti</option>
                {doshaOptions.map(dosha => (
                  <option key={dosha} value={dosha}>{dosha}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Current Symptoms
              <span className="text-gray-500 text-xs ml-2">(comma-separated)</span>
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="e.g., dry skin, anxiety, irregular digestion, fatigue"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Health Goals
              <span className="text-gray-500 text-xs ml-2">(comma-separated)</span>
            </label>
            <textarea
              name="healthGoals"
              value={formData.healthGoals}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="e.g., better sleep, stress reduction, weight management, improved energy"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Adding Patient...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 p-4 bg-ayurveda-accent/10 rounded-lg">
        <h3 className="font-semibold text-ayurveda-primary mb-2">Ayurvedic Constitution Guide:</h3>
        <div className="text-sm space-y-1">
          <p><strong>Vata:</strong> Air + Space - Movement, creativity, anxiety when imbalanced</p>
          <p><strong>Pitta:</strong> Fire + Water - Metabolism, intelligence, anger when imbalanced</p>
          <p><strong>Kapha:</strong> Earth + Water - Structure, stability, lethargy when imbalanced</p>
        </div>
      </div>
    </div>
  );
};

export default AddPatientPage;