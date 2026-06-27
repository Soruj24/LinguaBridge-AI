import { RedisConnection } from "./connection";

export class RedisOperations {
  private memoryCache: Map<string, { value: string; expires?: number }> = new Map();
  private connection: RedisConnection;

  constructor(connection: RedisConnection) {
    this.connection = connection;
  }

  private get fallbackMode(): boolean {
    return this.connection.isInFallbackMode();
  }

  async get(key: string): Promise<string | null> {
    if (this.fallbackMode) {
      const item = this.memoryCache.get(key);
      if (!item) return null;
      if (item.expires && item.expires < Date.now()) {
        this.memoryCache.delete(key);
        return null;
      }
      return item.value;
    }

    try {
      return await this.connection.getClient().get(key);
    } catch {
      this.connection.setFallbackMode(true);
      return this.get(key);
    }
  }

  async set(key: string, value: string, expireInSeconds?: number): Promise<string> {
    if (this.fallbackMode) {
      const expires = expireInSeconds ? Date.now() + expireInSeconds * 1000 : undefined;
      this.memoryCache.set(key, { value, expires });
      return "OK";
    }

    try {
      if (expireInSeconds) {
        return await this.connection.getClient().setex(key, expireInSeconds, value);
      }
      return await this.connection.getClient().set(key, value);
    } catch {
      this.connection.setFallbackMode(true);
      return this.set(key, value, expireInSeconds);
    }
  }

  async del(key: string | string[]): Promise<number> {
    if (this.fallbackMode) {
      if (Array.isArray(key)) {
        let count = 0;
        key.forEach((k) => {
          if (this.memoryCache.delete(k)) count++;
        });
        return count;
      }
      return this.memoryCache.delete(key) ? 1 : 0;
    }

    try {
      if (Array.isArray(key)) return await this.connection.getClient().del(...key);
      return await this.connection.getClient().del(key);
    } catch {
      this.connection.setFallbackMode(true);
      return this.del(key);
    }
  }

  async exists(key: string): Promise<number> {
    if (this.fallbackMode) {
      return this.memoryCache.has(key) ? 1 : 0;
    }

    try {
      return await this.connection.getClient().exists(key);
    } catch {
      this.connection.setFallbackMode(true);
      return this.exists(key);
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    if (this.fallbackMode) {
      const item = this.memoryCache.get(key);
      if (item) {
        item.expires = Date.now() + seconds * 1000;
        return 1;
      }
      return 0;
    }

    try {
      return await this.connection.getClient().expire(key, seconds);
    } catch {
      this.connection.setFallbackMode(true);
      return this.expire(key, seconds);
    }
  }

  async ttl(key: string): Promise<number> {
    if (this.fallbackMode) {
      const item = this.memoryCache.get(key);
      if (!item || !item.expires) return -2;
      return Math.max(0, Math.floor((item.expires - Date.now()) / 1000));
    }

    try {
      return await this.connection.getClient().ttl(key);
    } catch {
      this.connection.setFallbackMode(true);
      return this.ttl(key);
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    if (this.fallbackMode) {
      const item = this.memoryCache.get(`${key}:${field}`);
      return item ? item.value : null;
    }

    try {
      return await this.connection.getClient().hget(key, field);
    } catch {
      this.connection.setFallbackMode(true);
      return this.hget(key, field);
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    if (this.fallbackMode) {
      this.memoryCache.set(`${key}:${field}`, { value });
      return 1;
    }

    try {
      return await this.connection.getClient().hset(key, field, value);
    } catch {
      this.connection.setFallbackMode(true);
      return this.hset(key, field, value);
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
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
      return await this.connection.getClient().hgetall(key);
    } catch {
      this.connection.setFallbackMode(true);
      return this.hgetall(key);
    }
  }

  async hdel(key: string, field: string | string[]): Promise<number> {
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
      if (Array.isArray(field)) return await this.connection.getClient().hdel(key, ...field);
      return await this.connection.getClient().hdel(key, field);
    } catch {
      this.connection.setFallbackMode(true);
      return this.hdel(key, field);
    }
  }

  async lpush(key: string, value: string | string[]): Promise<number> {
    try {
      if (Array.isArray(value)) return await this.connection.getClient().lpush(key, ...value);
      return await this.connection.getClient().lpush(key, value);
    } catch (error) {
      throw error;
    }
  }

  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.connection.getClient().publish(channel, message);
    } catch (error) {
      throw error;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.connection.getSubscriber().subscribe(channel);
      this.connection.getSubscriber().on("message", (receivedChannel, message) => {
        if (receivedChannel === channel) callback(message);
      });
    } catch (error) {
      throw error;
    }
  }

  async unsubscribe(channel?: string): Promise<void> {
    try {
      if (channel) await this.connection.getSubscriber().unsubscribe(channel);
      else await this.connection.getSubscriber().unsubscribe();
    } catch (error) {
      throw error;
    }
  }
}
