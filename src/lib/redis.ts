import Redis from 'ioredis';

const redis = new Redis('redis://default:wN60NNWFlSNtuNNxVPddyPmo4e3Z4Xvt@redis-19974.c325.us-east-1-4.ec2.redns.redis-cloud.com:19974', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export default redis; 