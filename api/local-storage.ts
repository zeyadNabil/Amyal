import * as fs from 'fs';
import * as path from 'path';

const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.local-storage');

// Ensure storage directory exists
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

export const localStore = {
  async get(key: string): Promise<string | null> {
    const filePath = path.join(LOCAL_STORAGE_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  },

  async set(key: string, value: string): Promise<void> {
    const filePath = path.join(LOCAL_STORAGE_DIR, `${key}.json`);
    fs.writeFileSync(filePath, value, 'utf-8');
  }
};

export function isLocalDev(): boolean {
  return !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'development';
}
