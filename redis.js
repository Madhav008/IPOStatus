// redis.js
import redis from 'redis'
import { logger } from './logger.js';
// Initialize Redis client
const redisClient = redis.createClient({
    host: '192.168.1.124',
    port: 6379,
});


(async () => {
    await redisClient.connect();
})();

redisClient.on('connect', function () {
    console.log('Connected!');
    logger.info({ message: "Redis Connected" })
});

redisClient.on('error', (err) => {
    console.error(err);
    logger.info({ message: err })
});

export {
    redisClient
}

