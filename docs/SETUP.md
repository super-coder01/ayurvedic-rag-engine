# 🔧 Setup Guide

## Prerequisites
- Node.js (v16+)
- Groq API key (get from https://console.groq.com/)
- Your RAG data files (optional - system works with sample data)

## Quick Setup

### Windows
```bash
setup.bat
```

### Linux/Mac
```bash
chmod +x setup.sh && ./setup.sh
```

### Manual Setup
```bash
# 1. Install dependencies
npm run install:all

# 2. Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your GROQ_API_KEY

# 3. Place data files (optional)
cp your_data_files/* backend/data/

# 4. Test setup
npm run test:rag
```

## Environment Configuration

Edit `backend/.env`:
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
USE_LOCAL_STORAGE=true
```

## Data Files Structure

Place in `backend/data/`:
- `faiss_index.bin` - Vector search index
- `text_chunks.txt` - Ayurvedic knowledge chunks
- `ingredients.json` - Ingredient database
- `recipes.json` - Recipe database

## Verification

```bash
npm run test:rag      # Test RAG system
npm run test:storage  # Test data persistence
npm start            # Start the system
```