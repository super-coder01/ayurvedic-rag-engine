import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const DietitianProfile = () => {
  const { user } = useAuth();
  const [dietitianData, setDietitianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDietitianData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDietitianData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/dietitians/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDietitianData(response.data.dietitian);
    } catch (error) {
      setError('Failed to fetch dietitian data');
      console.error('Error fetching dietitian data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ayurveda-primary"></div>
          <span className="ml-3">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !dietitianData) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Error</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={fetchDietitianData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Dietitian Info Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-ayurveda-primary">
            👨‍⚕️ Dietitian Profile
          </h2>
          <div className="text-sm text-gray-500">
            Member since {formatDate(dietitianData.createdAt)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-ayurveda-light to-white p-4 rounded-lg">
            <div className="text-ayurveda-primary font-semibold mb-2">Name</div>
            <div className="text-lg">{dietitianData.username}</div>
          </div>
          
          <div className="bg-gradient-to-r from-ayurveda-light to-white p-4 rounded-lg">
            <div className="text-ayurveda-primary font-semibold mb-2">Email</div>
            <div className="text-lg">{dietitianData.email}</div>
          </div>
          
          <div className="bg-gradient-to-r from-ayurveda-light to-white p-4 rounded-lg">
            <div className="text-ayurveda-primary font-semibold mb-2">Total Patients</div>
            <div className="text-2xl font-bold text-ayurveda-secondary">
              {dietitianData.patients.length}
            </div>
          </div>
        </div>
      </div>

      {/* Patients Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-ayurveda-primary">
            👥 Your Patients
          </h3>
          <Link to="/patients/add" className="btn-primary">
            Add New Patient
          </Link>
        </div>

        {dietitianData.patients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h4>
            <p className="text-gray-500 mb-4">Start building your practice by adding your first patient</p>
            <Link to="/patients/add" className="btn-primary">
              Add First Patient
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {dietitianData.patients.map((patient) => (
              <div key={patient._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <div className="text-sm text-gray-600">
                          Age: {patient.age} • Constitution: {patient.prakriti} • Imbalance: {patient.vikriti}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Added: {formatDate(patient.createdAt)}
                      {patient.lastUpdated && patient.lastUpdated !== patient.createdAt && (
                        <span> • Updated: {formatDate(patient.lastUpdated)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/patients/${patient._id}`}
                      className="bg-ayurveda-accent text-white px-3 py-1 rounded text-sm hover:bg-ayurveda-secondary transition-colors"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/generate-plan?patientId=${patient._id}`}
                      className="btn-primary text-sm py-1"
                    >
                      Generate Plan
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-ayurveda-primary mb-2">
            {dietitianData.patients.filter(p => p.vikriti.includes('Vata')).length}
          </div>
          <div className="text-sm text-gray-600">Vata Imbalance Patients</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-ayurveda-secondary mb-2">
            {dietitianData.patients.filter(p => p.vikriti.includes('Pitta')).length}
          </div>
          <div className="text-sm text-gray-600">Pitta Imbalance Patients</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-ayurveda-accent mb-2">
            {dietitianData.patients.filter(p => p.vikriti.includes('Kapha')).length}
          </div>
          <div className="text-sm text-gray-600">Kapha Imbalance Patients</div>
        </div>
      </div>
    </div>
  );
};

export default DietitianProfile;