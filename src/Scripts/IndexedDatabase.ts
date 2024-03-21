interface GetObj {
    db: IDBDatabase,
    query: string
}
interface SetObj {
    db: IDBDatabase,
    object: SetInnerObject
}
interface SetInnerObject {
    UserContent: string,
    blob: Blob
}
export default {
    db: () => { // Get the Indexed DB Database
        return new Promise<IDBDatabase>((resolve, reject) => {
            let request = indexedDB.open("PDFPointerDB", 1); 
            request.onupgradeneeded = () => { // Create the new entry. "UserContent" will be the key that will identify the resource
                let db = request.result;
                let storage = db.createObjectStore("ContentBuffer", { keyPath: "UserContent" });
                storage.createIndex("blob", "blob", { unique: true });
                storage.transaction.oncomplete = () => resolve(db);
                storage.transaction.onerror = (ex) => reject(ex);
            }
            request.onsuccess = () => resolve(request.result);
            request.onblocked = (ex) => reject(ex);
            request.onerror = (ex) => reject(ex)
        })
    },
    get: ({ db, query }: GetObj) => { // Get a content from the database
        return new Promise<SetInnerObject | undefined>((resolve, reject) => {
            let transaction = db.transaction(["ContentBuffer"], "readonly");
            let objectStore = transaction.objectStore("ContentBuffer");
            let request = objectStore.get(query);
            request.onsuccess = () => {
                db.close();
                resolve(request.result);
            }
            request.onerror = (ex) => {
                db.close();
                reject(ex);
            }
        })
    },
    set: ({ db, object }: SetObj) => { // Set a Blob to the database
        return new Promise<void>((resolve, reject) => {
            let transaction = db.transaction(["ContentBuffer"], "readwrite");
            let objectStore = transaction.objectStore("ContentBuffer");
            let storage = objectStore.get(object.UserContent ?? "Unknown"); // Check if the value already exists, so that it can be updated rather than added as a new entry
            storage.onsuccess = () => {
                let requestUpdate = storage.result === undefined ? objectStore.add(object) : objectStore.put(object);
                requestUpdate.onsuccess = () => {
                    db.close();
                    resolve();
                }
                requestUpdate.onerror = (ex) => {
                    db.close();
                    reject(ex);
                }
            }
            storage.onerror = (ex) => {
                db.close();
                reject(ex);
            }
        })
    },
    remove: ({ db, query }: GetObj) => { // Remove an item from the Database
        return new Promise<void>((resolve, reject) => {
            let transaction = db.transaction(["ContentBuffer"], "readwrite");
            let objectStore = transaction.objectStore("ContentBuffer");
            let request = objectStore.delete(query);
            request.onsuccess = () => resolve();
            request.onerror = (ex) => reject(ex);
        })
    }
}