// OITS Dhaka Agro ERP - Field Warehouse Service Worker
const CACHE_NAME = "agro-erp-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg"
];

// Install Event
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing Field Warehouse Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching App Shell and Static Assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating Field Warehouse Service Worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing Old Cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network First, fallback to Cache for offline field staff)
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response to put into cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        console.log("[Service Worker] Offline mode active. Serving cached asset for:", event.request.url);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML page request, return cached index.html
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/index.html");
          }
        });
      })
  );
});

// Sync Event (Offline approvals push)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-approvals") {
    event.waitUntil(syncApprovals());
  }
});

async function syncApprovals() {
  const dbName = "AgroErpOfflineDB";
  const storeName = "pendingApprovals";

  const dbRequest = indexedDB.open(dbName, 1);
  return new Promise((resolve, reject) => {
    dbRequest.onsuccess = async () => {
      const db = dbRequest.result;
      if (!db.objectStoreNames.contains(storeName)) return resolve(null);
      
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const approvalsRequest = store.getAll();

      approvalsRequest.onsuccess = async () => {
        const approvals = approvalsRequest.result;
        if (approvals.length === 0) return resolve(null);

        try {
          const response = await fetch("/api/approvals/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ approvals })
          });

          if (response.ok) {
            const clearTx = db.transaction(storeName, "readwrite");
            clearTx.objectStore(storeName).clear();
            console.log("[Service Worker] Sync Successful. Approvals pushed to Neon.");
            resolve(null);
          } else {
            reject(new Error("Sync failed with status: " + response.status));
          }
        } catch (err) {
          console.error("[Service Worker] Sync Network Error:", err);
          reject(err);
        }
      };
    };
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

