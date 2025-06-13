import {createDb} from "./fileDb";

export type Log = {
  id: number;
  raw: string;
  title: string;
  story: string;
  characters: string[];
}

const db = createDb<Log>("./data/logs.json");

export const logsRepository = {
  create: (raw: string): Log => ({id: Date.now(), raw: raw, title: "", story: "", characters: []}),

  all: async () => await db.load(),

  findById: async (id: number) => {
    const logs = await db.load();

    return logs.find(x => x.id === id);
  },

  save: async (log: Log) => {
    let items = await db.load();

    items = items.filter(a => a.id !== log.id);
    items.push(log);

    await db.save(items);
  }
}