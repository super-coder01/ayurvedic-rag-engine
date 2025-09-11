const fs = require('fs');
const path = require('path');

class LocalStorageService {
  constructor() {
    this.storage = {
      users: new Map(),
      patients: new Map(),
      ingredients: [],
      recipes: []
    };
    this.dataDir = path.join(__dirname, '../data');
    this.persistentFiles = {
      users: path.join(this.dataDir, 'users.json'),
      patients: path.join(this.dataDir, 'patients.json')
    };
    this.init();
  }

  async init() {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      
      await this.loadPersistentData();
      await this.loadStaticData();
      console.log('✅ Local storage service initialized');
    } catch (error) {
      console.error('❌ Local storage initialization failed:', error);
    }
  }

  async loadPersistentData() {
    try {
      // Load users
      if (fs.existsSync(this.persistentFiles.users)) {
        const usersData = JSON.parse(fs.readFileSync(this.persistentFiles.users, 'utf8'));
        this.storage.users = new Map(usersData.map(user => [user._id, user]));
        console.log(`👥 Loaded ${this.storage.users.size} dietitians from users.json`);
      }

      // Load patients
      if (fs.existsSync(this.persistentFiles.patients)) {
        const patientsData = JSON.parse(fs.readFileSync(this.persistentFiles.patients, 'utf8'));
        this.storage.patients = new Map(patientsData.map(patient => [patient._id, patient]));
        console.log(`👤 Loaded ${this.storage.patients.size} patients from patients.json`);
      }
    } catch (error) {
      console.error('Error loading persistent data:', error);
    }
  }

  async loadStaticData() {
    try {
      // Load ingredients
      const ingredientsPath = path.join(__dirname, '../data/ingredients.json');
      if (fs.existsSync(ingredientsPath)) {
        this.storage.ingredients = JSON.parse(fs.readFileSync(ingredientsPath, 'utf8'));
        console.log(`📦 Loaded ${this.storage.ingredients.length} ingredients from ingredients.json`);
      } else {
        // Fallback to sample data
        const samplePath = path.join(__dirname, '../data/sample-ingredients.json');
        if (fs.existsSync(samplePath)) {
          this.storage.ingredients = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
          console.log(`📦 Loaded ${this.storage.ingredients.length} ingredients from sample-ingredients.json`);
        }
      }

      // Load recipes
      const recipesPath = path.join(__dirname, '../data/recipes.json');
      if (fs.existsSync(recipesPath)) {
        this.storage.recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
        console.log(`📦 Loaded ${this.storage.recipes.length} recipes from recipes.json`);
      } else {
        // Fallback to sample data
        const samplePath = path.join(__dirname, '../data/sample-recipes.json');
        if (fs.existsSync(samplePath)) {
          this.storage.recipes = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
          console.log(`📦 Loaded ${this.storage.recipes.length} recipes from sample-recipes.json`);
        }
      }
    } catch (error) {
      console.error('Error loading static data:', error);
    }
  }

  async insert(collection, document) {
    const id = document._id || `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const docWithId = { ...document, _id: id };
    
    if (this.storage[collection] instanceof Map) {
      this.storage[collection].set(id, docWithId);
      // Persist to file for users and patients
      if (collection === 'users' || collection === 'patients') {
        await this.persistToFile(collection);
      }
    } else if (Array.isArray(this.storage[collection])) {
      this.storage[collection].push(docWithId);
    }
    
    return Promise.resolve({ id, ok: true, rev: '1-local' });
  }

  async get(collection, id) {
    if (this.storage[collection] instanceof Map) {
      return Promise.resolve(this.storage[collection].get(id) || null);
    } else if (Array.isArray(this.storage[collection])) {
      const item = this.storage[collection].find(item => item._id === id);
      return Promise.resolve(item || null);
    }
    return Promise.resolve(null);
  }

  async find(collection, selector = {}) {
    let results = [];
    
    if (this.storage[collection] instanceof Map) {
      results = Array.from(this.storage[collection].values());
    } else if (Array.isArray(this.storage[collection])) {
      results = [...this.storage[collection]];
    }

    // Simple selector matching
    if (Object.keys(selector).length > 0) {
      results = results.filter(doc => {
        return Object.entries(selector).every(([key, value]) => {
          return doc[key] === value;
        });
      });
    }

    return Promise.resolve(results);
  }

  async update(collection, id, updates) {
    const existing = await this.get(collection, id);
    if (!existing) {
      throw new Error('Document not found');
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    
    if (this.storage[collection] instanceof Map) {
      this.storage[collection].set(id, updated);
      // Persist to file for users and patients
      if (collection === 'users' || collection === 'patients') {
        await this.persistToFile(collection);
      }
    } else if (Array.isArray(this.storage[collection])) {
      const index = this.storage[collection].findIndex(item => item._id === id);
      if (index !== -1) {
        this.storage[collection][index] = updated;
      }
    }

    return Promise.resolve(updated);
  }

  async delete(collection, id) {
    let deleted = false;
    
    if (this.storage[collection] instanceof Map) {
      deleted = this.storage[collection].delete(id);
      // Persist to file for users and patients
      if ((collection === 'users' || collection === 'patients') && deleted) {
        await this.persistToFile(collection);
      }
    } else if (Array.isArray(this.storage[collection])) {
      const index = this.storage[collection].findIndex(item => item._id === id);
      if (index !== -1) {
        this.storage[collection].splice(index, 1);
        deleted = true;
      }
    }
    
    return Promise.resolve({ deleted });
  }

  // Persist data to JSON files
  async persistToFile(collection) {
    try {
      if (this.persistentFiles[collection] && this.storage[collection] instanceof Map) {
        const data = Array.from(this.storage[collection].values());
        fs.writeFileSync(this.persistentFiles[collection], JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error(`Error persisting ${collection} to file:`, error);
    }
  }

  // Get storage statistics
  getStats() {
    return {
      users: this.storage.users.size,
      patients: this.storage.patients.size,
      ingredients: this.storage.ingredients.length,
      recipes: this.storage.recipes.length
    };
  }

  // Get dietitian with their patients
  async getDietitianWithPatients(dietitianId) {
    const dietitian = await this.get('users', dietitianId);
    if (!dietitian) {
      return null;
    }

    const patients = await this.find('patients', { dietitianId });
    
    return {
      ...dietitian,
      patients: patients.map(patient => ({
        _id: patient._id,
        name: patient.name,
        age: patient.age,
        prakriti: patient.prakriti,
        vikriti: patient.vikriti,
        createdAt: patient.createdAt,
        lastUpdated: patient.updatedAt || patient.createdAt
      }))
    };
  }

  // Get patient with dietitian info
  async getPatientWithDietitian(patientId) {
    const patient = await this.get('patients', patientId);
    if (!patient) {
      return null;
    }

    const dietitian = await this.get('users', patient.dietitianId);
    
    return {
      ...patient,
      dietitian: dietitian ? {
        _id: dietitian._id,
        username: dietitian.username,
        email: dietitian.email
      } : null
    };
  }

  // Get all dietitians with patient counts
  async getAllDietitiansWithStats() {
    const dietitians = Array.from(this.storage.users.values());
    
    return dietitians.map(dietitian => {
      const patientCount = Array.from(this.storage.patients.values())
        .filter(patient => patient.dietitianId === dietitian._id).length;
      
      return {
        _id: dietitian._id,
        username: dietitian.username,
        email: dietitian.email,
        createdAt: dietitian.createdAt,
        patientCount
      };
    });
  }
}

module.exports = new LocalStorageService();