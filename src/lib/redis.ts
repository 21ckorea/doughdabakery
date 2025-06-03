import Redis from 'ioredis';

// Redis Cloud URL (기본값으로 설정)
const REDIS_URL = process.env.REDIS_URL || 'redis://default:wN60NNWFlSNtuNNxVPddyPmo4e3Z4Xvt@redis-19974.c325.us-east-1-4.ec2.redns.redis-cloud.com:19974';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  connectTimeout: 10000, // 연결 타임아웃 10초
  lazyConnect: true,    // 필요할 때만 연결
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

// 초기 연결 시도
redis.connect().catch(err => {
  console.error('Failed to connect to Redis:', err);
});

export default redis; 