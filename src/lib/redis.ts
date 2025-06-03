import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://default:wN60NNWFlSNtuNNxVPddyPmo4e3Z4Xvt@redis-19974.c325.us-east-1-4.ec2.redns.redis-cloud.com:19974';

let redis: Redis;

try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true;
      }
      return false;
    },
  });

  redis.on('error', (error) => {
    console.error('Redis connection error:', error);
  });

  redis.on('connect', () => {
    console.log('Successfully connected to Redis');
  });

} catch (error) {
  console.error('Failed to create Redis instance:', error);
  throw error;
}

export default redis; 