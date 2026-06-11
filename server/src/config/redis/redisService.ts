import { RedisCore } from "./redisCore";
import { IRedisDataOps, redisDataOps } from "./redisDataOps";
import { IRedisAdvancedOps, redisAdvancedOps } from "./redisAdvancedOps";
import { setupGracefulShutdown } from "./redisSetup";

class RedisService extends RedisCore {}
interface RedisService extends RedisCore, IRedisDataOps, IRedisAdvancedOps {}

Object.assign(RedisService.prototype, redisDataOps);
Object.assign(RedisService.prototype, redisAdvancedOps);

const redisService = new RedisService();
setupGracefulShutdown(redisService);

export const redis = redisService;
export default redisService;
