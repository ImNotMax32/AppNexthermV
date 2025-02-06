const globalForStore = globalThis as unknown as {
  supabaseStore: Record<string, string> | undefined;
};

export const store = globalForStore.supabaseStore ?? {
  now: new Date().toISOString(),
};

if (process.env.NODE_ENV !== "production") globalForStore.supabaseStore = store;

/**
 * Returns a localStorage-like object that stores the key-value pairs in memory.
 */
export function memoryLocalStorageAdapter(
  store: { [key: string]: string } = {}
) {
  return {
    getItem: (key: string) => {
      console.log("getting item", key, "from store", store);
      return store[key] || null;
    },

    setItem: (key: string, data: string) => {
      console.log("setting item", key, "from store", store);
      store[key] = data;
      console.log("store is now", store);
    },

    removeItem: (key: string) => {
      console.log("deleting item", key, "from store", store);
      delete store[key];
    },
  };
}
