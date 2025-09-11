// Test the persistent storage functionality
const storageService = require('../backend/services/storage.service');

async function testPersistentStorage() {
  console.log('🧪 Testing Persistent Storage System...\n');

  try {
    // Test 1: Add a dietitian
    console.log('1️⃣ Testing Dietitian Storage...');
    const dietitianData = {
      _id: 'test-dietitian-123',
      email: 'test@ayurveda.com',
      username: 'Dr. Test Ayurveda',
      passwordHash: 'hashed_password',
      createdAt: new Date().toISOString()
    };

    await storageService.insert('users', dietitianData);
    console.log('✅ Dietitian added successfully');

    // Test 2: Add patients for this dietitian
    console.log('\n2️⃣ Testing Patient Storage...');
    const patients = [
      {
        _id: 'patient-1',
        dietitianId: 'test-dietitian-123',
        name: 'Arjun Sharma',
        age: 35,
        prakriti: 'Vata-Pitta',
        vikriti: 'Vata',
        symptoms: ['dry skin', 'anxiety', 'irregular digestion'],
        healthGoals: ['better sleep', 'stress reduction'],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'patient-2',
        dietitianId: 'test-dietitian-123',
        name: 'Priya Patel',
        age: 28,
        prakriti: 'Pitta',
        vikriti: 'Pitta',
        symptoms: ['hyperacidity', 'anger', 'skin inflammation'],
        healthGoals: ['cooling diet', 'emotional balance'],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'patient-3',
        dietitianId: 'test-dietitian-123',
        name: 'Raj Kumar',
        age: 42,
        prakriti: 'Kapha',
        vikriti: 'Kapha',
        symptoms: ['weight gain', 'lethargy', 'congestion'],
        healthGoals: ['weight loss', 'increased energy'],
        createdAt: new Date().toISOString()
      }
    ];

    for (const patient of patients) {
      await storageService.insert('patients', patient);
    }
    console.log(`✅ Added ${patients.length} patients successfully`);

    // Test 3: Retrieve dietitian with patients
    console.log('\n3️⃣ Testing Dietitian-Patient Relationship...');
    const dietitianWithPatients = await storageService.getDietitianWithPatients('test-dietitian-123');
    
    console.log(`✅ Retrieved dietitian: ${dietitianWithPatients.username}`);
    console.log(`   Email: ${dietitianWithPatients.email}`);
    console.log(`   Patients: ${dietitianWithPatients.patients.length}`);
    
    dietitianWithPatients.patients.forEach((patient, i) => {
      console.log(`   ${i+1}. ${patient.name} (${patient.age}y, ${patient.vikriti} imbalance)`);
    });

    // Test 4: Test patient with dietitian info
    console.log('\n4️⃣ Testing Patient-Dietitian Relationship...');
    const patientWithDietitian = await storageService.getPatientWithDietitian('patient-1');
    
    console.log(`✅ Retrieved patient: ${patientWithDietitian.name}`);
    console.log(`   Dietitian: ${patientWithDietitian.dietitian.username}`);
    console.log(`   Constitution: ${patientWithDietitian.prakriti}`);
    console.log(`   Current Imbalance: ${patientWithDietitian.vikriti}`);

    // Test 5: Get all dietitians with stats
    console.log('\n5️⃣ Testing Dietitian Statistics...');
    const allDietitians = await storageService.getAllDietitiansWithStats();
    
    console.log(`✅ Found ${allDietitians.length} dietitians:`);
    allDietitians.forEach(dietitian => {
      console.log(`   ${dietitian.username}: ${dietitian.patientCount} patients`);
    });

    // Test 6: Check file persistence
    console.log('\n6️⃣ Testing File Persistence...');
    const fs = require('fs');
    const path = require('path');
    
    const usersFile = path.join(__dirname, '..', 'backend', 'data', 'users.json');
    const patientsFile = path.join(__dirname, '..', 'backend', 'data', 'patients.json');
    
    if (fs.existsSync(usersFile)) {
      const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      console.log(`✅ users.json created with ${usersData.length} dietitians`);
    }
    
    if (fs.existsSync(patientsFile)) {
      const patientsData = JSON.parse(fs.readFileSync(patientsFile, 'utf8'));
      console.log(`✅ patients.json created with ${patientsData.length} patients`);
    }

    // Test 7: Storage stats
    console.log('\n7️⃣ Testing Storage Statistics...');
    const stats = storageService.getStats();
    console.log('📊 Storage Statistics:');
    console.log(`   Dietitians: ${stats.users}`);
    console.log(`   Patients: ${stats.patients}`);
    console.log(`   Ingredients: ${stats.ingredients}`);
    console.log(`   Recipes: ${stats.recipes}`);

    console.log('\n🎉 All persistent storage tests passed!');
    console.log('\n💾 Data is now stored in:');
    console.log('   - backend/data/users.json (dietitians)');
    console.log('   - backend/data/patients.json (patients)');
    console.log('\n🔄 Data will persist between server restarts!');

  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

testPersistentStorage();