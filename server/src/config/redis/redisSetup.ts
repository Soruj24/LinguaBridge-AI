import { RedisCore } from "./redisCore";
import { IRedisDataOps } from "./redisDataOps";
import { IRedisAdvancedOps } from "./redisAdvancedOps";

type RedisServiceType = RedisCore & IRedisDataOps & IRedisAdvancedOps;

export const setupGracefulShutdown = (service: RedisServiceType): void => {
  if (process.env.NODE_ENV !== "test") {
    service.connect().catch(console.error);
  }

  process.on("SIGINT", async () => {
    console.log("Shutting down Redis connections...");
    await service.disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Shutting down Redis connections...");
    await service.disconnect();
    process.exit(0);
  });
};
