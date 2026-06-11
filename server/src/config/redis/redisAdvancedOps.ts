import { RedisCore } from "./redisCore";

export interface IRedisAdvancedOps {
  hget(key: string, field: string): Promise<string | null>;
  hset(key: string, field: string, value: string): Promise<number>;
  hgetall(key: string): Promise<Record<string, string>>;
  hdel(key: string, field: string | string[]): Promise<number>;
  lpush(key: string, value: string | string[]): Promise<number>;
  publish(channel: string, message: string): Promise<number>;
  subscribe(channel: string, callback: (message: string) => void): Promise<void>;
  unsubscribe(channel?: string): Promise<void>;
}

export const redisAdvancedOps: IRedisAdvancedOps = {
  async hget(this: RedisCore & IRedisAdvancedOps, key: string, field: string): Promise<string | null> {
    if (this.fallbackMode) {
      const item = this.memoryCache.get(`${key}:${field}`);
      return item ? item.value : null;
    }
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      console.error("Redis hget error, using fallback:", error);
      this.fallbackMode = true;
      return this.hget(key, field);
    }
  },

  async hset(this: RedisCore & IRedisAdvancedOps, key: string, field: string, value: string): Promise<number> {
    if (this.fallbackMode) {
      this.memoryCache.set(`${key}:${field}`, { value });
      return 1;
    }
    try {
      return await this.client.hset(key, field, value);
    } catch (error) {
      console.error("Redis hset error, using fallback:", error);
      this.fallbackMode = true;
      return this.hset(key, field, value);
    }
  },

  async hgetall(this: RedisCore & IRedisAdvancedOps, key: string): Promise<Record<string, string>> {
    if (this.fallbackMode) {
      const result: Record<string, string> = {};
      const prefix = `${key}:`;
      this.memoryCache.forEach((value, cacheKey) => {
        if (cacheKey.startsWith(prefix)) {
          const field = cacheKey.substring(prefix.length);
          result[field] = value.value;
        }
      });
      return result;
    }
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      console.error("Redis hgetall error, using fallback:", error);
      this.fallbackMode = true;
      return this.hgetall(key);
    }
  },

  async hdel(this: RedisCore & IRedisAdvancedOps, key: string, field: string | string[]): Promise<number> {
    if (this.fallbackMode) {
      if (Array.isArray(field)) {
        let count = 0;
        field.forEach((f) => {
          if (this.memoryCache.delete(`${key}:${f}`)) count++;
        });
        return count;
      }
      return this.memoryCache.delete(`${key}:${field}`) ? 1 : 0;
    }
    try {
      if (Array.isArray(field)) return await this.client.hdel(key, ...field);
      return await this.client.hdel(key, field);
    } catch (error) {
      console.error("Redis hdel error, using fallback:", error);
      this.fallbackMode = true;
      return this.hdel(key, field);
    }
  },

  async lpush(this: RedisCore & IRedisAdvancedOps, key: string, value: string | string[]): Promise<number> {
    if (this.fallbackMode) {
      console.warn("List operations not fully supported in fallback mode");
      return Array.isArray(value) ? value.length : 1;
    }
    try {
      if (Array.isArray(value)) return await this.client.lpush(key, ...value);
      return await this.client.lpush(key, value);
    } catch (error) {
      console.error("Redis lpush error:", error);
      throw error;
    }
  },

  async publish(this: RedisCore & IRedisAdvancedOps, channel: string, message: string): Promise<number> {
    if (this.fallbackMode) {
      console.warn("Pub/Sub not supported in fallback mode");
      return 0;
    }
    try {
      return await this.client.publish(channel, message);
    } catch (error) {
      console.error("Redis publish error:", error);
      throw error;
    }
  },

  async subscribe(this: RedisCore & IRedisAdvancedOps, channel: string, callback: (message: string) => void): Promise<void> {
    if (this.fallbackMode) {
      console.warn("Pub/Sub not supported in fallback mode");
      return;
    }
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on("message", (receivedChannel, message) => {
        if (receivedChannel === channel) callback(message);
      });
    } catch (error) {
      console.error("Redis subscribe error:", error);
      throw error;
    }
  },

  async unsubscribe(this: RedisCore & IRedisAdvancedOps, channel?: string): Promise<void> {
    if (this.fallbackMode) {
      console.warn("Pub/Sub not supported in fallback mode");
      return;
    }
    try {
      if (channel) await this.subscriber.unsubscribe(channel);
      else await this.subscriber.unsubscribe();
    } catch (error) {
      console.error("Redis unsubscribe error:", error);
      throw error;
    }
  },
};
