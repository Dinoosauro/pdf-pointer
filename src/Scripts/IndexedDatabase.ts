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
    /**
     * Get the Indexed DB Database
     * @returns A promise, with the requested database
     */
    db: () => {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open("PDFPointerDB", 1);
            request.onupgradeneeded = () => { // Create the new entry. "UserContent" will be the key that will identify the resource
                const db = request.result;
                const storage = db.createObjectStore("ContentBuffer", { keyPath: "UserContent" });
                storage.createIndex("blob", "blob", { unique: true });
                storage.transaction.oncomplete = () => resolve(db);
                storage.transaction.onerror = (ex) => reject(ex);
            }
            request.onsuccess = () => resolve(request.result);
            request.onblocked = (ex) => reject(ex);
            request.onerror = (ex) => reject(ex)
        })
    },
    /**
     * Get a content from the database
     * @param db the database required for this operation
     * @param query the identifier of the requested resource
     * @returns a Promise, with the requested entry if available
     */
    get: ({ db, query }: GetObj) => {
        return new Promise<SetInnerObject | undefined>((resolve, reject) => {
            const transaction = db.transaction(["ContentBuffer"], "readonly");
            const objectStore = transaction.objectStore("ContentBuffer");
            const request = objectStore.get(query);
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
    /**
     * Set a Blob to the database
     * @param db the database required for this operation
     * @param object the content to save in the database
     * @returns A promise, resolved when the content has been saved in the database
     */
    set: ({ db, object }: SetObj) => {
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(["ContentBuffer"], "readwrite");
            const objectStore = transaction.objectStore("ContentBuffer");
            const storage = objectStore.get(object.UserContent ?? "Unknown"); // Check if the value already exists, so that it can be updated rather than added as a new entry
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
    /**
     * Remove an item from the database
     * @param db the database required for this operation
     * @param query the identifier of the resource to delete
     * @returns A promise, resolved when the item has been deleted
     */
    remove: ({ db, query }: GetObj) => {
        return new Promise<void>((resolve, reject) => {
            let transaction = db.transaction(["ContentBuffer"], "readwrite");
            let objectStore = transaction.objectStore("ContentBuffer");
            let request = objectStore.delete(query);
            request.onsuccess = () => resolve();
            request.onerror = (ex) => reject(ex);
        })
    }
}