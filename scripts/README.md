# 🛠️ Scripts

Utility scripts for development and testing.

## Available Scripts

- **setup-data-files.js** - Check data file status
- **test-rag-only.js** - Test RAG components
- **test-storage.js** - Test data persistence
- **test-shutdown.js** - Test graceful shutdown

## Usage

```bash
# From project root
node scripts/setup-data-files.js
node scripts/test-rag-only.js
node scripts/test-storage.js
node scripts/test-shutdown.js
```

Or use npm scripts:
```bash
npm run test:rag
npm run test:storage
npm run test:shutdown
```