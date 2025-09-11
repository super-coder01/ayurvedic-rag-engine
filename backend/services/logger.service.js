const fs = require('fs');
const path = require('path');

class LoggerService {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/server.log');
    this.clients = new Set();
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    // Console output with colors
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      debug: '\x1b[35m'    // Magenta
    };
    
    const color = colors[level] || '\x1b[0m';
    const reset = '\x1b[0m';
    
    console.log(`${color}[${timestamp}] ${level.toUpperCase()}: ${message}${reset}`);
    if (data) {
      console.log(`${color}${JSON.stringify(data, null, 2)}${reset}`);
    }

    // File output
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.logFile, logLine);

    // Send to connected clients
    this.broadcast(logEntry);
  }

  info(message, data) {
    this.log('info', message, data);
  }

  success(message, data) {
    this.log('success', message, data);
  }

  warning(message, data) {
    this.log('warning', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  // WebSocket-like functionality for real-time logs
  addClient(res) {
    this.clients.add(res);
    
    // Send recent logs to new client
    this.sendRecentLogs(res);
    
    // Remove client when connection closes
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  broadcast(logEntry) {
    const data = `data: ${JSON.stringify(logEntry)}\n\n`;
    
    this.clients.forEach(client => {
      try {
        client.write(data);
      } catch (error) {
        this.clients.delete(client);
      }
    });
  }

  sendRecentLogs(res) {
    try {
      if (fs.existsSync(this.logFile)) {
        const logs = fs.readFileSync(this.logFile, 'utf8')
          .split('\n')
          .filter(line => line.trim())
          .slice(-50) // Last 50 logs
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(log => log !== null);

        logs.forEach(log => {
          res.write(`data: ${JSON.stringify(log)}\n\n`);
        });
      }
    } catch (error) {
      this.error('Failed to send recent logs', error.message);
    }
  }

  clearLogs() {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.unlinkSync(this.logFile);
      }
      this.info('Log file cleared');
    } catch (error) {
      this.error('Failed to clear logs', error.message);
    }
  }
}

module.exports = new LoggerService();