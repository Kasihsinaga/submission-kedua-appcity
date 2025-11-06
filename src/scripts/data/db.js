import { openDB } from 'idb';
import * as Api from './api';

// === Konstanta Database ===
const DATABASE_NAME = 'citycare-db';
const DATABASE_VERSION = 1;
const REPORTS_STORE = 'reports';
const OUTBOX_STORE = 'outbox';

// === Inisialisasi Database ===
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(REPORTS_STORE)) {
      const reportsStore = db.createObjectStore(REPORTS_STORE, { keyPath: 'id' });
      reportsStore.createIndex('id', 'id', { unique: true });
    }

    if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
      const outboxStore = db.createObjectStore(OUTBOX_STORE, { keyPath: 'id' });
      outboxStore.createIndex('id', 'id', { unique: true });
    }
  },
});

// === Fungsi: Tambah Laporan ===
export const addReport = async (report) => {
  const db = await dbPromise;
  await db.put(REPORTS_STORE, report); // pakai put() agar tidak duplikat
  console.log('✅ Report saved to IndexedDB:', report);
};

// === Fungsi: Ambil Semua Laporan ===
export const getAllReports = async () => {
  const db = await dbPromise;
  return db.getAll(REPORTS_STORE);
};

// === Fungsi: Hapus Laporan ===
export const deleteReport = async (id) => {
  const db = await dbPromise;
  await db.delete(REPORTS_STORE, id);
  console.log(`🗑️ Report with id=${id} deleted`);
};

// === Fungsi: Outbox (untuk laporan offline) ===
export const addToOutbox = async (report) => {
  const db = await dbPromise;
  await db.put(OUTBOX_STORE, report);
  console.log('📦 Added to outbox:', report);
};

export const getOutbox = async () => {
  const db = await dbPromise;
  return db.getAll(OUTBOX_STORE);
};

export const clearOutboxItem = async (id) => {
  const db = await dbPromise;
  await db.delete(OUTBOX_STORE, id);
  console.log(`🧹 Outbox item ${id} cleared`);
};

// === Sinkronisasi Offline -> Online ===
export const syncOfflineReports = async () => {
  const outboxItems = await getOutbox();

  if (!outboxItems.length) {
    console.log('No offline reports to sync.');
    return;
  }

  console.log('🔄 Syncing offline reports:', outboxItems.length);

  for (const report of outboxItems) {
    try {
      const response = await Api.postStory({
        description: report.description,
        photo: report.photo,
        lat: report.lat,
        lon: report.lon,
      });

      if (!response.error) {
        await clearOutboxItem(report.id);
        console.log(`✅ Report ${report.id} synced successfully`);
      } else {
        console.warn(`⚠️ Failed to sync report ${report.id}:`, response.message);
      }
    } catch (err) {
      console.error(`❌ Error syncing report ${report.id}:`, err);
    }
  }
};