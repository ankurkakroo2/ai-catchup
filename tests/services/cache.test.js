import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs/promises";
import path from "path";
import { CacheService } from "../../src/services/cache.js";

describe("CacheService", () => {
  let cache;
  const testCacheDir = "/tmp/test-cache";

  beforeEach(() => {
    cache = new CacheService({ cacheDir: testCacheDir });
  });

  afterEach(async () => {
    try {
      await cache.clear();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe("set and get", () => {
    it("should store and retrieve data", async () => {
      const testData = { title: "Test Article", content: "Test content" };
      await cache.set("test-key", testData);
      const result = await cache.get("test-key");
      expect(result).toEqual(testData);
    });

    it("should return null for non-existent key", async () => {
      const result = await cache.get("non-existent-key");
      expect(result).toBeNull();
    });

    it("should expire cache after TTL", async () => {
      const shortTTL = 100; // 100ms
      const shortCache = new CacheService({
        cacheDir: testCacheDir,
        ttl: shortTTL,
      });
      const testData = { title: "Test" };
      await shortCache.set("expiring-key", testData);

      // Wait for TTL to pass
      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = await shortCache.get("expiring-key");
      expect(result).toBeNull();
    });

    it("should not expire cache before TTL", async () => {
      const ttl = 5000; // 5 seconds
      const longCache = new CacheService({ cacheDir: testCacheDir, ttl });
      const testData = { title: "Test" };
      await longCache.set("valid-key", testData);

      // Check immediately
      const result = await longCache.get("valid-key");
      expect(result).toEqual(testData);
    });
  });

  describe("delete", () => {
    it("should delete cached data", async () => {
      await cache.set("delete-test", { data: "test" });
      await cache.delete("delete-test");
      const result = await cache.get("delete-test");
      expect(result).toBeNull();
    });

    it("should not throw error when deleting non-existent key", async () => {
      await expect(cache.delete("non-existent")).resolves.not.toThrow();
    });
  });

  describe("clear", () => {
    it("should clear all cached data", async () => {
      await cache.set("key1", { data: "test1" });
      await cache.set("key2", { data: "test2" });
      await cache.set("key3", { data: "test3" });

      await cache.clear();

      expect(await cache.get("key1")).toBeNull();
      expect(await cache.get("key2")).toBeNull();
      expect(await cache.get("key3")).toBeNull();
    });
  });

  describe("has", () => {
    it("should return true for existing valid cache", async () => {
      await cache.set("exists", { data: "test" });
      const result = await cache.has("exists");
      expect(result).toBe(true);
    });

    it("should return false for non-existent cache", async () => {
      const result = await cache.has("non-existent");
      expect(result).toBe(false);
    });

    it("should return false for expired cache", async () => {
      const shortCache = new CacheService({ cacheDir: testCacheDir, ttl: 50 });
      await shortCache.set("expired", { data: "test" });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await shortCache.has("expired");
      expect(result).toBe(false);
    });
  });

  describe("getCacheFilePath", () => {
    it("should generate correct file path", () => {
      const filePath = cache.getCacheFilePath("test-key");
      expect(filePath).toBe(path.join(testCacheDir, "test-key.json"));
    });
  });
});
