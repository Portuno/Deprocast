
import { supabase, isCloudEnabled } from './supabase';

const DB_NAME = 'DeprocastOS_v1';
const DB_VERSION = 1;

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        ['users', 'projects', 'contacts', 'events', 'focusSessions', 'notes'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' });
        });
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  async getAll<T>(storeName: string, userId?: string): Promise<T[]> {
    // 1. Cloud Synchronization Logic
    if (isCloudEnabled() && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from(storeName)
          .select('*')
          .eq('userId', userId);
        
        if (!error && data) {
          // Sync local with cloud data
          for (const item of data) {
            await this.saveLocal(storeName, item);
          }
          return data as T[];
        }
      } catch (e) {
        console.warn(`Sync Failed for ${storeName}: Falling back to Local Archive.`);
      }
    }

    // 2. Local Fallback (IndexedDB)
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not initialized');
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async saveLocal<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return;
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.put(item);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async save<T>(storeName: string, item: any): Promise<void> {
    // Commit local first for zero-latency UI
    await this.saveLocal(storeName, item);

    // Commit to Cloud in background
    if (isCloudEnabled() && supabase) {
      try {
        const { error } = await supabase
          .from(storeName)
          .upsert(item);
        if (error) console.error(`Sync Conflict in ${storeName}:`, error.message);
      } catch (e) {
        console.warn("Cloud infrastructure unreachable. Changes stored in Local Archive.");
      }
    }
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (this.db) {
      const transaction = this.db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).delete(id);
    }

    if (isCloudEnabled() && supabase) {
      try {
        await supabase.from(storeName).delete().eq('id', id);
      } catch (e) {
        console.warn("Delete failed on cloud, purged locally.");
      }
    }
  }
}

export const db = new DatabaseService();
