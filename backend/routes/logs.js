const express = require('express');
const logger = require('../services/logger.service');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Stream logs in real-time (Server-Sent Events)
router.get('/stream', authMiddleware, (req, res) => {
  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Add client to logger service
  logger.addClient(res);
  logger.info('New log viewer connected');

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write('data: {"type":"ping"}\n\n');
  }, 30000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
    logger.info('Log viewer disconnected');
  });
});

// Get recent logs
router.get('/recent', authMiddleware, (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, '../logs/server.log');
    
    if (!fs.existsSync(logFile)) {
      return res.json({ logs: [] });
    }

    const logs = fs.readFileSync(logFile, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .slice(-100) // Last 100 logs
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(log => log !== null);

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Clear logs
router.delete('/clear', authMiddleware, (req, res) => {
  try {
    logger.clearLogs();
    res.json({ message: 'Logs cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

module.exports = router;