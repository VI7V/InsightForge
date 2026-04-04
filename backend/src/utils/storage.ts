// Storage service: Uses Upstash Redis when configured, falls back to in-memory
// For Vercel deployment: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// For local dev: in-memory store is used automatically

interface StorageBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

// In-memory fallback (local dev / no Redis configured)
class MemoryStore implements StorageBackend {
  private store = new Map<string, { value: string; expires?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expires && Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expires: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async keys(pattern: string): Promise<string[]> {
    const prefix = pattern.replace('*', '');
    return Array.from(this.store.keys()).filter(k => k.startsWith(prefix));
  }
}

// Upstash Redis backend (production)
class UpstashStore implements StorageBackend {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  private async request(command: string[]): Promise<unknown> {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });
    const data = (await res.json()) as { result: unknown };
    return data.result;
  }

  async get(key: string): Promise<string | null> {
    const result = await this.request(['GET', key]);
    return result as string | null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.request(['SET', key, value, 'EX', String(ttlSeconds)]);
    } else {
      await this.request(['SET', key, value]);
    }
  }

  async del(key: string): Promise<void> {
    await this.request(['DEL', key]);
  }

  async keys(pattern: string): Promise<string[]> {
    const result = await this.request(['KEYS', pattern]);
    return (result as string[]) || [];
  }
}

function createStorage(): StorageBackend {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    console.log('✅ Using Upstash Redis for storage');
    return new UpstashStore(url, token);
  }
  console.log('📦 Using in-memory storage (local dev)');
  return new MemoryStore();
}

export const storage = createStorage();

// Helper wrappers
export async function storeJSON<T>(key: string, data: T, ttl?: number): Promise<void> {
  await storage.set(key, JSON.stringify(data), ttl);
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await storage.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function deleteKey(key: string): Promise<void> {
  await storage.del(key);
}

export async function listKeys(pattern: string): Promise<string[]> {
  return storage.keys(pattern);
}
