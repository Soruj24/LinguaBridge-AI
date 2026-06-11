import Redis, { Redis as RedisClient, RedisOptions } from "ioredis";

export class RedisCore {
  client!: RedisClient;
  subscriber!: RedisClient;
  isConnected: boolean = false;
  reconnectAttempts: number = 0;
  maxReconnectAttempts: number = 10;
  fallbackMode: boolean = false;
  memoryCache: Map<string, { value: string; expires?: number }> = new Map();

  constructor() {
    this.initializeClient();
    this.initializeSubscriber();
    this.setupEventHandlers();
  }

  private getRedisConfig(): RedisOptions {
    const config: RedisOptions = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      db: parseInt(process.env.REDIS_DB || "0"),
      keyPrefix: process.env.REDIS_KEY_PREFIX || "app:",
      lazyConnect: true,
      connectTimeout: 10000,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      password: process.env.REDIS_PASSWORD,
    };
    return config;
  }

  private initializeClient(): void {
    if (process.env.REDIS_URL) {
      this.client = new Redis(process.env.REDIS_URL);
    } else {
      this.client = new Redis(this.getRedisConfig());
    }
  }

  private initializeSubscriber(): void {
    const config = this.getRedisConfig();
    config.keyPrefix = undefined;
    if (process.env.REDIS_URL) {
      this.subscriber = new Redis(process.env.REDIS_URL);
    } else {
      this.subscriber = new Redis(config);
    }
  }

  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      console.log("✅ Redis client connected");
      this.isConnected = true;
      this.fallbackMode = false;
      this.reconnectAttempts = 0;
    });
    this.client.on("ready", () => console.log("✅ Redis client ready"));
    this.client.on("error", (error) => {
      console.error("❌ Redis client error:", error.message);
      this.isConnected = false;
    });
    this.client.on("close", () => {
      console.log("⚠️ Redis client connection closed");
      this.isConnected = false;
    });
    this.client.on("reconnecting", (delay: number) => {
      this.reconnectAttempts++;
      console.log(`🔄 Redis client reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("❌ Max reconnection attempts reached. Switching to fallback mode.");
        this.fallbackMode = true;
      }
    });
    this.subscriber.on("connect", () => console.log("✅ Redis subscriber connected"));
    this.subscriber.on("error", (error) => console.error("❌ Redis subscriber error:", error.message));
  }

  async connect(): Promise<void> {
    try {
      await Promise.all([this.client.connect(), this.subscriber.connect()]);
      console.log("✅ Redis connections established");
    } catch (error) {
      console.error("❌ Failed to connect to Redis, using fallback mode:", error);
      this.fallbackMode = true;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await Promise.all([this.client.disconnect(), this.subscriber.disconnect()]);
      console.log("✅ Redis connections closed");
    } catch (error) {
      console.error("❌ Error closing Redis connections:", error);
      throw error;
    }
  }

  async ping(): Promise<string> {
    if (this.fallbackMode) return "FALLBACK";
    try {
      return await this.client.ping();
    } catch {
      return "ERROR";
    }
  }

  async isHealthy(): Promise<boolean> {
    if (this.fallbackMode) return true;
    try {
      const pong = await this.ping();
      return pong === "PONG" && this.isConnected;
    } catch {
      return false;
    }
  }

  getClient(): RedisClient {
    return this.client;
  }

  getSubscriber(): RedisClient {
    return this.subscriber;
  }

  isInFallbackMode(): boolean {
    return this.fallbackMode;
  }
}
