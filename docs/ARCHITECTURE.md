# 🏗️ System Architecture

## Overview

The Ayurvedic RAG Nutrition Engine is a full-stack application that combines traditional Ayurvedic knowledge with modern AI to generate personalized diet plans.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • Groq API      │
│ • Patient Mgmt  │    │ • RAG Pipeline  │    │ • FAISS Index   │
│ • Diet Plans    │    │ • Auth System   │    │                 │
│ • Log Viewer    │    │ • Data Storage  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### Frontend (React)
- **Pages**: Dashboard, Patient Management, Diet Plan Generation
- **Components**: Reusable UI components with Ayurvedic theming
- **Services**: API client with authentication
- **State**: Context API for user management

### Backend (Node.js/Express)
- **Routes**: RESTful API endpoints
- **Services**: Core business logic (Storage, Vector, Groq, Logger)
- **Middleware**: Authentication, error handling
- **Data**: Local JSON file storage

### RAG Pipeline
1. **Patient Analysis** - Extract constitution and symptoms
2. **Ingredient Matching** - Find dosha-balancing ingredients
3. **Recipe Selection** - Choose appropriate recipes
4. **Vector Search** - Retrieve relevant Ayurvedic knowledge
5. **AI Generation** - Create personalized plan with Groq

## Data Flow

```
User Input → Patient Data → RAG Pipeline → AI Generation → Formatted Output
     ↓              ↓             ↓             ↓              ↓
  Frontend    Local Storage   Vector DB    Groq API      React UI
```

## Storage Architecture

```
backend/data/
├── Static Data (Read-only)
│   ├── ingredients.json     # Ayurvedic ingredients
│   ├── recipes.json         # Traditional recipes
│   ├── text_chunks.txt      # Knowledge chunks
│   └── faiss_index.bin      # Vector index
└── Dynamic Data (Read/Write)
    ├── users.json           # Dietitians
    └── patients.json        # Patient records
```

## Security

- **JWT Authentication** - Secure API access
- **Data Isolation** - Dietitians only see their patients
- **Local Storage** - No external database dependencies
- **Input Validation** - Sanitized user inputs

## Scalability

- **Modular Design** - Easy to extend and modify
- **Stateless API** - Horizontal scaling ready
- **File-based Storage** - Can migrate to database easily
- **Microservice Ready** - Services can be separated