# 📁 Data Setup Guide

## File Placement

Place your processed data files in `backend/data/`:

```
backend/data/
├── faiss_index.bin          # FAISS vector index
├── text_chunks.txt          # Text chunks with metadata  
├── recipes.json             # Ayurvedic recipes database
├── ingredients.json         # Ayurvedic ingredients database
├── users.json              # Dietitians (auto-generated)
├── patients.json           # Patients (auto-generated)
└── sample-*.json           # Fallback sample data
```

## File Formats

### text_chunks.txt
```
Text chunk content|||Source Name|||metadata_tags
According to Ayurveda, food should be consumed based on constitution|||Charaka Samhita|||dosha_vata
```

### ingredients.json
```json
[
  {
    "_id": "turmeric",
    "name": "Turmeric (Haridra)",
    "description": "Golden spice with anti-inflammatory properties",
    "ayurvedicProperties": {
      "dosha_effects": {
        "vata": "reduces",
        "pitta": "increases", 
        "kapha": "reduces"
      }
    }
  }
]
```

### recipes.json
```json
[
  {
    "_id": "golden_milk",
    "name": "Golden Milk",
    "description": "Traditional turmeric milk drink",
    "dosha_focus": "vata",
    "instructions": ["Step 1", "Step 2"],
    "health_benefits": ["Anti-inflammatory", "Immunity boost"]
  }
]
```

## Verification

```bash
node setup-data-files.js  # Check file status
npm run test:rag          # Test with your data
```

## Fallback Behavior

If files are missing:
- Uses sample data for ingredients/recipes
- Uses built-in text chunks for knowledge
- System continues working with reduced functionality