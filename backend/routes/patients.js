const express = require('express');
const { v4: uuidv4 } = require('uuid');
const storageService = require('../services/storage.service');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all patients for the authenticated dietitian
router.get('/', async (req, res) => {
  try {
    const patients = await storageService.find('patients', { 
      dietitianId: req.user.userId 
    });
    
    res.json({ patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get a specific patient
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await storageService.get('patients', patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Ensure the patient belongs to the authenticated dietitian
    if (patient.dietitianId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Add a new patient
router.post('/', async (req, res) => {
  try {
    const { name, age, prakriti, vikriti, symptoms, healthGoals } = req.body;

    // Validation
    if (!name || !age || !prakriti || !vikriti) {
      return res.status(400).json({ 
        error: 'Name, age, prakriti, and vikriti are required' 
      });
    }

    const patientId = uuidv4();
    const patient = {
      _id: patientId,
      dietitianId: req.user.userId,
      name,
      age: parseInt(age),
      prakriti,
      vikriti,
      symptoms: symptoms || [],
      healthGoals: healthGoals || [],
      createdAt: new Date().toISOString()
    };

    await storageService.insert('patients', patient);

    res.status(201).json({
      message: 'Patient added successfully',
      patient
    });
  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ error: 'Failed to add patient' });
  }
});

// Update a patient
router.put('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const updates = req.body;

    const patient = await storageService.get('patients', patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Ensure the patient belongs to the authenticated dietitian
    if (patient.dietitianId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedPatient = {
      ...patient,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await storageService.update('patients', patientId, updates);

    res.json({
      message: 'Patient updated successfully',
      patient: updatedPatient
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

module.exports = router;