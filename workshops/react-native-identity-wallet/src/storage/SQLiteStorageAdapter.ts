/**
 * SQLite-based persistent storage adapter for Pluto (Identus wallet storage).
 *
 * This adapter replaces StorageType.InMemory with a real database backed by
 * expo-sqlite. Use it in production apps where wallet data must survive
 * application restarts.
 *
 * Usage:
 *   First install the peer dependency (not in package.json by default):
 *     npx expo install expo-sqlite
 *
 *   Then:
 *     import { createSQLiteStore } from "@/storage/SQLiteStorageAdapter";
 *     const store = await createSQLiteStore("identus-wallet");
 *     const pluto = new SDK.Pluto(store, apollo);
 *
 * NOTE: This is a reference implementation. The Pluto storage interface evolves
 * with SDK releases — consult the SDK changelog when upgrading.
 *
 * The @trust0/ridb library is the recommended production storage layer; it
 * wraps RxDB and will gain an official React Native adapter. Until then, this
 * file shows the shape of a custom adapter so you can wire in expo-sqlite,
 * react-native-mmkv, or any other embedded database.
 */

import * as SQLite from "expo-sqlite";

// Pluto storage interface (simplified — matches SDK.StorageInterface)
export interface StorageInterface {
  findOne(collection: string, query: object): Promise<object | null>;
  findMany(collection: string, query?: object): Promise<object[]>;
  save(collection: string, document: object): Promise<void>;
  update(collection: string, query: object, update: object): Promise<void>;
  delete(collection: string, query: object): Promise<void>;
  clear(collection: string): Promise<void>;
}

export async function createSQLiteStore(
  dbName: string
): Promise<StorageInterface> {
  const db = await SQLite.openDatabaseAsync(dbName);

  // Bootstrap schema: a single generic key-value table per collection.
  // Real implementations should use typed tables per domain object.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pluto_store (
      collection TEXT NOT NULL,
      doc_id     TEXT NOT NULL,
      data       TEXT NOT NULL,
      PRIMARY KEY (collection, doc_id)
    );
  `);

  return {
    async findOne(collection, query) {
      const rows = await db.getAllAsync<{ data: string }>(
        `SELECT data FROM pluto_store WHERE collection = ?`,
        [collection]
      );
      const docs = rows.map((r: { data: string }) => JSON.parse(r.data));
      return (
        docs.find((d: any) =>
          Object.entries(query).every(([k, v]) => d[k] === v)
        ) ?? null
      );
    },

    async findMany(collection, query = {}) {
      const rows = await db.getAllAsync<{ data: string }>(
        `SELECT data FROM pluto_store WHERE collection = ?`,
        [collection]
      );
      const docs = rows.map((r: { data: string }) => JSON.parse(r.data));
      if (Object.keys(query).length === 0) return docs;
      return docs.filter((d: any) =>
        Object.entries(query).every(([k, v]) => d[k] === v)
      );
    },

    async save(collection, document) {
      const doc = document as Record<string, unknown>;
      const id = (doc.id as string) ?? crypto.randomUUID();
      await db.runAsync(
        `INSERT OR REPLACE INTO pluto_store (collection, doc_id, data)
         VALUES (?, ?, ?)`,
        [collection, id, JSON.stringify({ ...doc, id })]
      );
    },

    async update(collection, query, update) {
      const rows = await db.getAllAsync<{ doc_id: string; data: string }>(
        `SELECT doc_id, data FROM pluto_store WHERE collection = ?`,
        [collection]
      );
      for (const row of rows) {
        const doc = JSON.parse(row.data) as Record<string, unknown>;
        const matches = Object.entries(query).every(
          ([k, v]) => doc[k] === v
        );
        if (matches) {
          const updated = { ...doc, ...(update as object) };
          await db.runAsync(
            `UPDATE pluto_store SET data = ? WHERE collection = ? AND doc_id = ?`,
            [JSON.stringify(updated), collection, row.doc_id]
          );
        }
      }
    },

    async delete(collection, query) {
      const rows = await db.getAllAsync<{ doc_id: string; data: string }>(
        `SELECT doc_id, data FROM pluto_store WHERE collection = ?`,
        [collection]
      );
      for (const row of rows) {
        const doc = JSON.parse(row.data) as Record<string, unknown>;
        const matches = Object.entries(query).every(
          ([k, v]) => doc[k] === v
        );
        if (matches) {
          await db.runAsync(
            `DELETE FROM pluto_store WHERE collection = ? AND doc_id = ?`,
            [collection, row.doc_id]
          );
        }
      }
    },

    async clear(collection) {
      await db.runAsync(
        `DELETE FROM pluto_store WHERE collection = ?`,
        [collection]
      );
    },
  };
}
