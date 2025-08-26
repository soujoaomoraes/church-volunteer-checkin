// IndexedDB helper for church volunteer check-in system
// Provides: openDB, addCheckin, getAllCheckins, clearCheckins, addVolunteerCache, getVolunteerCache

const DB_NAME = 'church-volunteer-checkin';
const DB_VERSION = 1;
const CHECKINS_STORE = 'checkins';
const VOLUNTEER_CACHE_STORE = 'volunteerCache';

const IndexedDB = {
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(CHECKINS_STORE)) {
          db.createObjectStore(CHECKINS_STORE, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(VOLUNTEER_CACHE_STORE)) {
          db.createObjectStore(VOLUNTEER_CACHE_STORE, { keyPath: 'nome' });
        }
      };
    });
  },

  async addCheckin(data) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CHECKINS_STORE, 'readwrite');
      const store = tx.objectStore(CHECKINS_STORE);
      const req = store.add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async getAllCheckins() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CHECKINS_STORE, 'readonly');
      const store = tx.objectStore(CHECKINS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async clearCheckins() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CHECKINS_STORE, 'readwrite');
      const store = tx.objectStore(CHECKINS_STORE);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async addVolunteerCache(volunteer) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(VOLUNTEER_CACHE_STORE, 'readwrite');
      const store = tx.objectStore(VOLUNTEER_CACHE_STORE);
      const req = store.put(volunteer);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getVolunteerCache() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(VOLUNTEER_CACHE_STORE, 'readonly');
      const store = tx.objectStore(VOLUNTEER_CACHE_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
};

window.IndexedDB = IndexedDB;
