import AsyncStorage from "@react-native-async-storage/async-storage";
import type * as Models from "@hyperledger/identus-sdk/build/pluto/models";
import { InMemoryPlutoStore } from "./InMemoryPlutoStore";

export const PLUTO_STORAGE_KEY = "identus.pluto.tables";
type StoredModel = Models.Model;

/**
 * Pluto store backed by AsyncStorage. Persists wallet credentials, DIDs, and
 * mediator metadata across app restarts while remaining compatible with Expo Go.
 */
export class AsyncStoragePlutoStore extends InMemoryPlutoStore {
  private hydrated = false;

  async start(): Promise<void> {
    if (this.hydrated) {
      return;
    }

    const raw = await AsyncStorage.getItem(PLUTO_STORAGE_KEY);
    if (raw) {
      try {
        this.importTables(JSON.parse(raw));
      } catch (error) {
        console.warn("Failed to hydrate Pluto store, starting fresh:", error);
      }
    }

    this.hydrated = true;
  }

  async stop(): Promise<void> {
    await this.persist();
  }

  async insert<T extends StoredModel>(table: string, model: T): Promise<void> {
    await super.insert(table, model);
    await this.persist();
  }

  async update<T extends StoredModel>(table: string, model: T): Promise<void> {
    await super.update(table, model);
    await this.persist();
  }

  async delete(table: string, uuid: string): Promise<void> {
    await super.delete(table, uuid);
    await this.persist();
  }

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(PLUTO_STORAGE_KEY);
    this.importTables({});
  }

  static async clearPersisted(): Promise<void> {
    await AsyncStorage.removeItem(PLUTO_STORAGE_KEY);
  }

  private async persist(): Promise<void> {
    if (!this.hydrated) {
      return;
    }

    await AsyncStorage.setItem(
      PLUTO_STORAGE_KEY,
      JSON.stringify(this.exportTables())
    );
  }
}
