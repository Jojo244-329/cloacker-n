require('dotenv').config();
const redis = require('redis');
const axios = require('axios');

module.exports = {
  port: process.env.PORT || 3000,
  redisClient: redis.createClient({ url: process.env.REDIS_URL }),
  getGeoFromIP: async (ip) => {
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      return response.data.country_code.toLowerCase();
    } catch (err) {
      return 'unknown';
    }
  }
};
