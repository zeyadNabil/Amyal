// Local storage helper for development only
// Note: fs/path imports are lazy-loaded to avoid serverless errors

export const localStore = {
  async get(key: string): Promise<string | null> {
    // Only import fs when actually needed (local dev only)
    const fs = await import('fs');
    const path = await import('path');
    
    const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.local-storage');
    
    // Ensure storage directory exists
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
    
    const filePath = path.join(LOCAL_STORAGE_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return null;
  },

  async set(key: string, value: string): Promise<void> {
    // Only import fs when actually needed (local dev only)
    const fs = await import('fs');
    const path = await import('path');
    
    const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.local-storage');
    
    // Ensure storage directory exists
    if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
      fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
    }
    
    const filePath = path.join(LOCAL_STORAGE_DIR, `${key}.json`);
    fs.writeFileSync(filePath, value, 'utf-8');
  }
};

export function isLocalDev(): boolean {
  // Only use local storage when NOT in Vercel (no VERCEL_ENV set)
  return !process.env.VERCEL_ENV;
}
