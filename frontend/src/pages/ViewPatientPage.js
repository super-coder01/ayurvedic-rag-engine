import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { patientsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ViewPatientPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatient();
  }, [patientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPatient = async () => {
    try {
      const response = await patientsAPI.getById(patientId);
      setPatient(response.data.patient);
    } catch (error) {
      setError('Failed to fetch patient details');
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading patient details..." />;
  }

  if (error || !patient) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Not Found</h3>
          <p className="text-gray-500 mb-4">{error || 'The requested patient could not be found.'}</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-ayurveda-primary">
          Patient Details
        </h1>
        <div className="space-x-4">
          <Link 
            to={`/generate-plan?patientId=${patient._id}`}
            className="btn-primary"
          >
            Generate Diet Plan
          </Link>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-ayurveda-primary mb-4">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg font-medium">{patient.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Age</label>
                <p className="text-lg font-medium">{patient.age} years</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Prakriti (Constitution)</label>
                <p className="text-lg font-medium text-ayurveda-primary">{patient.prakriti}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Vikriti (Current Imbalance)</label>
                <p className="text-lg font-medium text-ayurveda-secondary">{patient.vikriti}</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">Patient Added</label>
              <p className="text-sm text-gray-500">
                {new Date(patient.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Dosha Information */}
        <div>
          <div className="card">
            <h2 className="text-xl font-semibold text-ayurveda-primary mb-4">
              Dosha Guide
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Vata</h3>
                <p className="text-blue-600">Air + Space elements. Governs movement, breathing, circulation.</p>
              </div>
              
              <div className="p-3 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-800">Pitta</h3>
                <p className="text-red-600">Fire + Water elements. Governs digestion, metabolism, transformation.</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Kapha</h3>
                <p className="text-green-600">Earth + Water elements. Governs structure, immunity, lubrication.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms and Health Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Current Symptoms */}
        <div className="card">
          <h2 className="text-xl font-semibold text-ayurveda-primary mb-4">
            Current Symptoms
          </h2>
          
          {patient.symptoms && patient.symptoms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.symptoms.map((symptom, index) => (
                <span 
                  key={index}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                >
                  {symptom}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No symptoms recorded</p>
          )}
        </div>

        {/* Health Goals */}
        <div className="card">
          <h2 className="text-xl font-semibold text-ayurveda-primary mb-4">
            Health Goals
          </h2>
          
          {patient.healthGoals && patient.healthGoals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.healthGoals.map((goal, index) => (
                <span 
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {goal}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No health goals recorded</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 text-center">
        <Link 
          to={`/generate-plan?patientId=${patient._id}`}
          className="btn-primary text-lg px-8 py-3"
        >
          🌿 Generate Personalized Diet Plan
        </Link>
      </div>
    </div>
  );
};

export default ViewPatientPage;