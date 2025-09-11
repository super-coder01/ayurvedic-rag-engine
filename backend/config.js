require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: '24h'
  },
  
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-8b-instant'
  },
  
  storage: {
    useLocal: process.env.USE_LOCAL_STORAGE === 'true' || true,
    dataPath: './data'
  }
};