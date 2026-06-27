import { RedisConnection } from "./connection";
import { RedisOperations } from "./operations";

class RedisService {
  private connection: RedisConnection;
  private operations: RedisOperations;

  constructor() {
    this.connection = new RedisConnection();
    this.operations = new RedisOperations(this.connection);
  }

  async connect() {
    return this.connection.connect();
  }

  async disconnect() {
    return this.connection.disconnect();
  }

  async ping() {
    return this.connection.ping();
  }

  async isHealthy() {
    return this.connection.isHealthy();
  }

  get client() {
    return this.operations;
  }

  getClient() {
    return this.connection.getClient();
  }

  getSubscriber() {
    return this.connection.getSubscriber();
  }
}

const redisService = new RedisService();

if (process.env.NODE_ENV !== "test") {
  redisService.connect().catch(console.error);
}

process.on("SIGINT", async () => {
  console.log("Shutting down Redis connections...");
  await redisService.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down Redis connections...");
  await redisService.disconnect();
  process.exit(0);
});

export const redis = redisService;
export default redisService;
