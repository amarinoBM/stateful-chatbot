/**
 * Mock implementation of Vercel KV for local development
 * This can be used when KV_URL environment variable is not set
 */

// In-memory store for development
const store = new Map<string, any>();

export const mockKv = {
  get: async <T>(key: string): Promise<T | null> => {
    console.log(`[Mock KV] Getting key: ${key}`);
    return store.get(key) || null;
  },
  
  set: async (key: string, value: any): Promise<void> => {
    console.log(`[Mock KV] Setting key: ${key}`, value);
    store.set(key, value);
    return Promise.resolve();
  },
  
  del: async (key: string): Promise<void> => {
    console.log(`[Mock KV] Deleting key: ${key}`);
    store.delete(key);
    return Promise.resolve();
  }
}; 