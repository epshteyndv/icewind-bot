import fs from "node:fs/promises";

export function createDb<T>(filePath: string) {
  let cache: T[] | undefined = undefined;
  let loadPromise: Promise<T[]> | undefined = undefined;

  return {
    load: async () => {
      if (cache) {
        return cache;
      }

      if (!loadPromise) {
        loadPromise = loadFromFile();
      }

      return loadPromise!;

      async function loadFromFile() {
        const fileData = await fs.readFile(filePath, {encoding: 'utf8'});
        return JSON.parse(fileData);
      }
    },

    save: async (items: T[]) => {
      cache = items;

      const jsonData = JSON.stringify(cache, null, 2);
      await fs.writeFile(filePath, jsonData, {encoding: 'utf8'});
    }
  }
}