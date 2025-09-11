# 🚀 Startup Guide

## Quick Start Options

### 1. Production Start (Recommended)
```bash
npm start
```
- Beautiful startup screen with system checks
- Graceful shutdown handling
- Colored output and status indicators

### 2. Development Mode
```bash
npm run dev
```
- Simple and fast startup
- Good for development work
- Auto-reload enabled

### 3. Windows Batch File
```bash
start.bat
```
- Double-click to run
- Automatic dependency checking
- Environment setup if needed

### 4. Manual Control
```bash
# Terminal 1
npm run backend

# Terminal 2  
npm run frontend
```

## Access Points

After startup:
- **Main App**: http://localhost:3000
- **API Health**: http://localhost:5000/api/health
- **Log Viewer**: Open `log-viewer.html`

## Stopping the System

- Press `Ctrl+C` for graceful shutdown
- System will cleanly stop both servers
- Data is automatically saved

## Troubleshooting

### Common Issues
- **Port in use**: Kill processes on ports 3000/5000
- **Dependencies missing**: Run `npm run install:all`
- **Environment missing**: Run setup script
- **Data files missing**: System uses sample data as fallback