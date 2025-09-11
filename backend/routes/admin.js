const express = require('express');
const storageService = require('../services/storage.service');
const authMiddleware = require('../middleware/auth');
const logger = require('../services/logger.service');

const router = express.Router();

// Get all dietitians with their patient counts
router.get('/dietitians', authMiddleware, async (req, res) => {
  try {
    const dietitians = await storageService.getAllDietitiansWithStats();
    
    logger.info('Retrieved all dietitians with stats', { count: dietitians.length });
    
    res.json({
      message: 'Dietitians retrieved successfully',
      dietitians,
      totalCount: dietitians.length
    });
  } catch (error) {
    logger.error('Error retrieving dietitians', error.message);
    res.status(500).json({ error: 'Failed to retrieve dietitians' });
  }
});

// Get specific dietitian with all their patients
router.get('/dietitians/:dietitianId', authMiddleware, async (req, res) => {
  try {
    const { dietitianId } = req.params;
    
    // Check if requesting user can access this data (either same user or admin)
    if (req.user.userId !== dietitianId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const dietitianWithPatients = await storageService.getDietitianWithPatients(dietitianId);
    
    if (!dietitianWithPatients) {
      return res.status(404).json({ error: 'Dietitian not found' });
    }
    
    logger.info('Retrieved dietitian with patients', { 
      dietitianId, 
      patientCount: dietitianWithPatients.patients.length 
    });
    
    res.json({
      message: 'Dietitian data retrieved successfully',
      dietitian: dietitianWithPatients
    });
  } catch (error) {
    logger.error('Error retrieving dietitian data', error.message);
    res.status(500).json({ error: 'Failed to retrieve dietitian data' });
  }
});

// Get patient with dietitian info
router.get('/patients/:patientId/full', authMiddleware, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const patientWithDietitian = await storageService.getPatientWithDietitian(patientId);
    
    if (!patientWithDietitian) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Check if requesting user can access this patient
    if (patientWithDietitian.dietitianId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    logger.info('Retrieved patient with dietitian info', { patientId });
    
    res.json({
      message: 'Patient data retrieved successfully',
      patient: patientWithDietitian
    });
  } catch (error) {
    logger.error('Error retrieving patient data', error.message);
    res.status(500).json({ error: 'Failed to retrieve patient data' });
  }
});

// Get system statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = storageService.getStats();
    
    // Get additional stats
    const allPatients = await storageService.find('patients', {});
    const patientsByDietitian = {};
    
    allPatients.forEach(patient => {
      if (!patientsByDietitian[patient.dietitianId]) {
        patientsByDietitian[patient.dietitianId] = 0;
      }
      patientsByDietitian[patient.dietitianId]++;
    });
    
    const enhancedStats = {
      ...stats,
      patientsByDietitian,
      averagePatientsPerDietitian: stats.users > 0 ? (stats.patients / stats.users).toFixed(1) : 0,
      dataFiles: {
        persistent: ['users.json', 'patients.json'],
        static: ['ingredients.json', 'recipes.json', 'text_chunks.txt', 'faiss_index.bin']
      }
    };
    
    logger.info('System stats retrieved', enhancedStats);
    
    res.json({
      message: 'System statistics retrieved successfully',
      stats: enhancedStats
    });
  } catch (error) {
    logger.error('Error retrieving system stats', error.message);
    res.status(500).json({ error: 'Failed to retrieve system statistics' });
  }
});

// Export/backup data
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const users = await storageService.find('users', {});
    const patients = await storageService.find('patients', {});
    
    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }));
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        users: sanitizedUsers,
        patients: patients
      },
      stats: storageService.getStats()
    };
    
    logger.info('Data export requested', { 
      users: sanitizedUsers.length, 
      patients: patients.length 
    });
    
    res.json({
      message: 'Data exported successfully',
      export: exportData
    });
  } catch (error) {
    logger.error('Error exporting data', error.message);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;