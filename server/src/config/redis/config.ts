import { RedisOptions } from "ioredis";

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  lazyConnect?: boolean;
  connectTimeout?: number;
}

export function getRedisConfig(): RedisOptions {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    db: parseInt(process.env.REDIS_DB || "0"),
    keyPrefix: process.env.REDIS_KEY_PREFIX || "app:",
    lazyConnect: true,
    connectTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    password: process.env.REDIS_PASSWORD,
  };
}

export function getSubscriberConfig(): RedisOptions {
  const config = getRedisConfig();
  config.keyPrefix = undefined;
  return config;
}
