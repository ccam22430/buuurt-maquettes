// Keep mockup images in this browser and identify the draft by its tab session.
window.merchantMedia = (() => {
  let id = sessionStorage.getItem('buuurt-media-draft-id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('buuurt-media-draft-id', id);
  }
  let connection;
  function database() {
    connection ??= new Promise((resolve, reject) => {
      const request = indexedDB.open('buuurt-mockup-media', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('images');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return connection;
  }
  async function access(kind, mode, operation) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('images', mode);
      const request = operation(transaction.objectStore('images'), id + ':' + kind);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
    });
  }
  return {
    get: kind => access(kind, 'readonly', (store, key) => store.get(key)),
    set: (kind, image) => access(kind, 'readwrite', (store, key) => store.put(image, key)),
    remove: kind => access(kind, 'readwrite', (store, key) => store.delete(key))
  };
})();
