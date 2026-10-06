/**
 * 通用的 in-memory 假資料庫，供各 app 的 MSW handlers 共用。
 * 提供分頁 / 關鍵字搜尋 / 精準欄位篩選 / 排序 / CRUD 能力。
 * 預設資料只存在記憶體中，重新整理頁面即會還原成種子資料（seed）；
 * 若需要讓新增的資料在重新整理後仍存在，可透過 `persistKey` 選項啟用 sessionStorage 持久化。
 */

export interface ListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export interface ListResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateMockDbOptions<T> {
  /** 新資料 id 的前綴，預設 'id' */
  idPrefix?: string;
  /** keyword 參數要模糊比對的欄位 */
  keywordFields?: (keyof T)[];
  /** query 帶了這些欄位時，會做精準比對篩選（=== 比較） */
  matchFields?: (keyof T)[];
  /**
   * 選擇性啟用 sessionStorage 持久化（預設不啟用，行為不變）。
   * 啟用後，新增/更新/刪除都會同步寫回 sessionStorage，重新整理頁面不會被還原成種子資料，
   * 只有關閉分頁或手動清除 session storage 才會重置回 seed —— 用來模擬「真的建立過」的資料庫效果。
   * 之後若要移除這個模擬行為，拿掉這個 option 即可，不影響呼叫方其他程式碼。
   */
  persistKey?: string;
}

export interface MockDb<T extends { id: string }> {
  list: (params?: ListParams) => ListResult<T>;
  getById: (id: string) => T | undefined;
  create: (payload: Omit<T, "id"> & Partial<Pick<T, "id">>) => T;
  update: (id: string, patch: Partial<T>) => T | undefined;
  remove: (id: string) => boolean;
  reset: () => void;
  all: () => T[];
}

function readPersistedStore<T>(key: string): T[] | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    // sessionStorage 不可用（例如無痕模式限制）或資料損毀時，退回種子資料即可
    return null;
  }
}

function writePersistedStore<T>(key: string, store: T[]): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(store));
  } catch {
    // 寫入失敗不影響記憶體內的操作結果，純粹是這次重新整理後不會還原
  }
}

export function createMockDb<T extends { id: string }>(
  seed: T[],
  options: CreateMockDbOptions<T> = {},
): MockDb<T> {
  const persisted = options.persistKey
    ? readPersistedStore<T>(options.persistKey)
    : null;
  let store: T[] = (persisted ?? seed).map((item) => ({ ...item }));
  let autoIncrement = seed.length;

  const persist = (): void => {
    if (options.persistKey) writePersistedStore(options.persistKey, store);
  };

  const genId = (): string => {
    autoIncrement += 1;
    return `${options.idPrefix ?? "id"}-${autoIncrement}-${Date.now()}`;
  };

  const list = (params: ListParams = {}): ListResult<T> => {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      sortBy,
      sortOrder = "asc",
      ...rest
    } = params;
    let result = [...store];

    if (options.matchFields) {
      for (const field of options.matchFields) {
        const value = rest[field as string];
        if (value !== undefined && value !== null && value !== "") {
          const target = String(value as string | number | boolean);
          result = result.filter((item) => String(item[field]) === target);
        }
      }
    }

    if (keyword && options.keywordFields?.length) {
      const kw = keyword.toLowerCase();
      result = result.filter((item) =>
        options.keywordFields!.some((field) =>
          String(item[field] ?? "")
            .toLowerCase()
            .includes(kw),
        ),
      );
    }

    if (sortBy) {
      const key = sortBy as keyof T;
      result.sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (av === bv) return 0;
        const cmp = av > bv ? 1 : -1;
        return sortOrder === "desc" ? -cmp : cmp;
      });
    }

    const total = result.length;
    const start = (page - 1) * pageSize;
    const paged = result.slice(start, start + pageSize);

    return { list: paged, total, page, pageSize };
  };

  const getById = (id: string): T | undefined =>
    store.find((item) => item.id === id);

  const create = (payload: Omit<T, "id"> & Partial<Pick<T, "id">>): T => {
    const newItem = { ...payload, id: payload.id ?? genId() } as T;
    store.unshift(newItem);
    persist();
    return newItem;
  };

  const update = (id: string, patch: Partial<T>): T | undefined => {
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    store[index] = { ...store[index], ...patch, id };
    persist();
    return store[index];
  };

  const remove = (id: string): boolean => {
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    persist();
    return true;
  };

  const reset = (): void => {
    store = seed.map((item) => ({ ...item }));
    persist();
  };

  const all = (): T[] => store;

  return { list, getById, create, update, remove, reset, all };
}
