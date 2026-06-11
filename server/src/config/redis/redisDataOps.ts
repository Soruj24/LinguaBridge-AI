import { RedisCore } from "./redisCore";

export interface IRedisDataOps {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, expireInSeconds?: number): Promise<string>;
  del(key: string | string[]): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
}

export const redisDataOps: IRedisDataOps = {
  async get(this: RedisCore & IRedisDataOps, key: string): Promise<string | null> {
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
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis get error, using fallback:", error);
      return this.get(key);
    }
  },

  async set(this: RedisCore & IRedisDataOps, key: string, value: string, expireInSeconds?: number): Promise<string> {
    if (this.fallbackMode) {
      const expires = expireInSeconds ? Date.now() + expireInSeconds * 1000 : undefined;
      this.memoryCache.set(key, { value, expires });
      return "OK";
    }
    try {
      if (expireInSeconds) {
        return await this.client.setex(key, expireInSeconds, value);
      }
      return await this.client.set(key, value);
    } catch (error) {
      console.error("Redis set error, using fallback:", error);
      this.fallbackMode = true;
      return this.set(key, value, expireInSeconds);
    }
  },

  async del(this: RedisCore & IRedisDataOps, key: string | string[]): Promise<number> {
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
      if (Array.isArray(key)) return await this.client.del(...key);
      return await this.client.del(key);
    } catch (error) {
      console.error("Redis del error, using fallback:", error);
      this.fallbackMode = true;
      return this.del(key);
    }
  },

  async exists(this: RedisCore & IRedisDataOps, key: string): Promise<number> {
    if (this.fallbackMode) {
      return this.memoryCache.has(key) ? 1 : 0;
    }
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.error("Redis exists error, using fallback:", error);
      this.fallbackMode = true;
      return this.exists(key);
    }
  },

  async expire(this: RedisCore & IRedisDataOps, key: string, seconds: number): Promise<number> {
    if (this.fallbackMode) {
      const item = this.memoryCache.get(key);
      if (item) {
        item.expires = Date.now() + seconds * 1000;
        return 1;
      }
      return 0;
    }
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.error("Redis expire error, using fallback:", error);
      this.fallbackMode = true;
      return this.expire(key, seconds);
    }
  },

  async ttl(this: RedisCore & IRedisDataOps, key: string): Promise<number> {
    if (this.fallbackMode) {
      const item = this.memoryCache.get(key);
      if (!item || !item.expires) return -2;
      return Math.max(0, Math.floor((item.expires - Date.now()) / 1000));
    }
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error("Redis ttl error, using fallback:", error);
      this.fallbackMode = true;
      return this.ttl(key);
    }
  },
};
