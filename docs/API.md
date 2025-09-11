# 🔌 API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /auth/register` - Register dietitian
- `POST /auth/login` - Login
- `GET /auth/verify` - Verify token

### Patients
- `GET /patients` - List dietitian's patients
- `GET /patients/:id` - Get patient details
- `POST /patients` - Add new patient
- `PUT /patients/:id` - Update patient

### Diet Plan Generation (RAG Core)
- `POST /dietplan/generate` - Generate personalized diet plan

### RAG Testing
- `GET /rag/test` - Test RAG components
- `POST /rag/test-vector` - Test vector search

### Admin & Analytics
- `GET /admin/dietitians` - List all dietitians with stats
- `GET /admin/dietitians/:id` - Get dietitian with patients
- `GET /admin/patients/:id/full` - Get patient with dietitian info
- `GET /admin/stats` - System statistics
- `GET /admin/export` - Export data

### Logs
- `GET /logs/stream` - Real-time log stream (SSE)
- `GET /logs/recent` - Get recent logs
- `DELETE /logs/clear` - Clear logs

### Health
- `GET /health` - API health check

## Example Requests

### Generate Diet Plan
```bash
curl -X POST http://localhost:5000/api/dietplan/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-123",
    "dietitianQuery": "Create a diet plan to reduce Vata imbalance"
  }'
```

### Test RAG Components
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/rag/test
```