import type { Query, QuerySelector } from "@hyperledger/identus-sdk/build/pluto/types";
import type * as Models from "@hyperledger/identus-sdk/build/pluto/models";
import SDK from "@hyperledger/identus-sdk";

type StoredModel = Models.Model;

export class InMemoryPlutoStore implements SDK.Pluto.Store {
  private readonly tables = new Map<string, Map<string, StoredModel>>();

  async start(): Promise<void> {
    // No-op for in-memory storage.
  }

  async stop(): Promise<void> {
    // No-op for in-memory storage.
  }

  async query<T extends StoredModel>(table: string, query?: Query<T>): Promise<T[]> {
    const rows = Array.from(this.getTable(table).values()) as T[];
    let results = query?.selector
      ? rows.filter((row) => this.matchesSelector(row, query.selector!))
      : rows;

    if (query?.sort?.length) {
      results = [...results].sort((left, right) =>
        this.compareRows(left, right, query.sort!)
      );
    }

    if (query?.skip) {
      results = results.slice(query.skip);
    }

    if (typeof query?.limit === "number") {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  async insert<T extends StoredModel>(table: string, model: T): Promise<void> {
    this.getTable(table).set(model.uuid, this.clone(model));
  }

  async update<T extends StoredModel>(table: string, model: T): Promise<void> {
    this.getTable(table).set(model.uuid, this.clone(model));
  }

  async delete(table: string, uuid: string): Promise<void> {
    this.getTable(table).delete(uuid);
  }

  /** Snapshot all tables for persistence layers. */
  exportTables(): Record<string, Record<string, StoredModel>> {
    const snapshot: Record<string, Record<string, StoredModel>> = {};
    for (const [table, rows] of this.tables.entries()) {
      snapshot[table] = Object.fromEntries(rows.entries());
    }
    return snapshot;
  }

  /** Restore tables from a snapshot produced by exportTables(). */
  importTables(snapshot: Record<string, Record<string, StoredModel>>): void {
    this.tables.clear();
    for (const [table, rows] of Object.entries(snapshot)) {
      const tableMap = new Map<string, StoredModel>();
      for (const [uuid, model] of Object.entries(rows)) {
        tableMap.set(uuid, this.clone(model));
      }
      this.tables.set(table, tableMap);
    }
  }

  protected getTable(table: string): Map<string, StoredModel> {
    let rows = this.tables.get(table);
    if (!rows) {
      rows = new Map<string, StoredModel>();
      this.tables.set(table, rows);
    }
    return rows;
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }

  private compareRows<T extends StoredModel>(
    left: T,
    right: T,
    sort: NonNullable<Query<T>["sort"]>
  ): number {
    for (const part of sort) {
      const [path, direction] = Object.entries(part)[0] ?? [];
      if (!path || !direction) {
        continue;
      }

      const leftValue = this.getValue(left, path);
      const rightValue = this.getValue(right, path);

      if (leftValue === rightValue) {
        continue;
      }

      const comparison = leftValue! > rightValue! ? 1 : -1;
      return direction === "desc" ? -comparison : comparison;
    }

    return 0;
  }

  private matchesSelector<T extends StoredModel>(
    row: T,
    selector: QuerySelector<T>
  ): boolean {
    if (
      selector.$and?.length &&
      !selector.$and.every((entry: QuerySelector<T>) =>
        this.matchesSelector(row, entry)
      )
    ) {
      return false;
    }

    if (
      selector.$or?.length &&
      !selector.$or.some((entry: QuerySelector<T>) =>
        this.matchesSelector(row, entry)
      )
    ) {
      return false;
    }

    if (
      selector.$nor?.some((entry: QuerySelector<T>) =>
        this.matchesSelector(row, entry)
      )
    ) {
      return false;
    }

    for (const [path, expected] of Object.entries(selector)) {
      if (path === "$and" || path === "$or" || path === "$nor") {
        continue;
      }

      if (!this.matchesValue(this.getValue(row, path), expected)) {
        return false;
      }
    }

    return true;
  }

  private matchesValue(actual: unknown, expected: unknown): boolean {
    if (!this.isOperatorObject(expected)) {
      return this.areEqual(actual, expected);
    }

    if (expected.$eq !== undefined && !this.areEqual(actual, expected.$eq)) {
      return false;
    }

    if (expected.$ne !== undefined && this.areEqual(actual, expected.$ne)) {
      return false;
    }

    if (expected.$in && !expected.$in.some((value) => this.areEqual(actual, value))) {
      return false;
    }

    if (expected.$nin && expected.$nin.some((value) => this.areEqual(actual, value))) {
      return false;
    }

    if (expected.$exists !== undefined && (actual !== undefined) !== expected.$exists) {
      return false;
    }

    if (expected.$gt != null && actual != null && !(actual > expected.$gt)) {
      return false;
    }

    if (expected.$gte != null && actual != null && !(actual >= expected.$gte)) {
      return false;
    }

    if (expected.$lt != null && actual != null && !(actual < expected.$lt)) {
      return false;
    }

    if (expected.$lte != null && actual != null && !(actual <= expected.$lte)) {
      return false;
    }

    if (expected.$regex !== undefined) {
      if (typeof actual !== "string") {
        return false;
      }

      const pattern =
        expected.$regex instanceof RegExp
          ? expected.$regex
          : new RegExp(expected.$regex, expected.$options);

      if (!pattern.test(actual)) {
        return false;
      }
    }

    return true;
  }

  private isOperatorObject(
    value: unknown
  ): value is {
    $eq?: unknown;
    $ne?: unknown;
    $in?: unknown[];
    $nin?: unknown[];
    $exists?: boolean;
    $gt?: unknown;
    $gte?: unknown;
    $lt?: unknown;
    $lte?: unknown;
    $regex?: string | RegExp;
    $options?: string;
  } {
    return !!value && typeof value === "object" && !Array.isArray(value)
      ? Object.keys(value).some((key) => key.startsWith("$"))
      : false;
  }

  private getValue(record: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>((current, key) => {
      if (current == null) {
        return undefined;
      }

      if (Array.isArray(current)) {
        const index = Number(key);
        return Number.isInteger(index) ? current[index] : undefined;
      }

      return typeof current === "object"
        ? (current as Record<string, unknown>)[key]
        : undefined;
    }, record);
  }

  private areEqual(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
  }
}
