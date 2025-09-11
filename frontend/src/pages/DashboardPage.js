import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import RAGStatus from '../components/RAGStatus';
import DietitianProfile from '../components/DietitianProfile';

const DashboardPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRAGStatus, setShowRAGStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

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
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-ayurveda-primary">
          Dietitian Dashboard
        </h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowRAGStatus(!showRAGStatus)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showRAGStatus ? 'Hide' : 'Show'} RAG Status
          </button>
          <Link to="/patients/add" className="btn-primary">
            Add New Patient
          </Link>
          <Link to="/generate-plan" className="btn-secondary">
            Generate Diet Plan
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-ayurveda-primary text-ayurveda-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👨‍⚕️ My Profile & Patients
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'patients'
                ? 'border-ayurveda-primary text-ayurveda-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👥 Patient List
          </button>
        </nav>
      </div>

      {showRAGStatus && (
        <div className="mb-8">
          <RAGStatus />
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'profile' && <DietitianProfile />}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first patient</p>
              <Link to="/patients/add" className="btn-primary">
                Add First Patient
              </Link>
            </div>
          ) : (
            patients.map((patient) => (
              <div key={patient._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-ayurveda-primary">
                    {patient.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Age: {patient.age}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Prakriti:</span>
                    <span className="text-sm">{patient.prakriti}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Vikriti:</span>
                    <span className="text-sm">{patient.vikriti}</span>
                  </div>
                </div>

                {patient.symptoms && patient.symptoms.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium">Symptoms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {patient.symptoms.slice(0, 3).map((symptom, index) => (
                        <span key={index} className="text-xs bg-ayurveda-accent/20 px-2 py-1 rounded">
                          {symptom}
                        </span>
                      ))}
                      {patient.symptoms.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{patient.symptoms.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link 
                    to={`/patients/${patient._id}`}
                    className="flex-1 text-center bg-ayurveda-accent text-white py-2 px-3 rounded text-sm hover:bg-ayurveda-secondary transition-colors"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/generate-plan?patientId=${patient._id}`}
                    className="flex-1 text-center btn-primary text-sm py-2"
                  >
                    Generate Plan
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;