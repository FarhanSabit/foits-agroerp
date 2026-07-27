const DB_NAME = "AgroErpOfflineDB";
const STORE_NAME = "pendingApprovals";

export interface PendingApproval {
  id: string;
  type: "PR" | "PO";
  timestamp: number;
  signatureDataUrl?: string;
  signatoryName?: string;
}

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const queueApproval = async (approval: PendingApproval) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(approval);
  
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await (registration as any).sync.register("sync-approvals");
      console.log("Background sync registered for approvals");
    } catch (err) {
      console.error("Background sync registration failed:", err);
    }
  }
};

export const getPendingApprovals = async (): Promise<PendingApproval[]> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

export const removeApproval = async (id: string) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
};
