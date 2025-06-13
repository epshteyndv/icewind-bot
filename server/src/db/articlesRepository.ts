import {createDb} from "./fileDb";

export type Article = {
  id: number;
  title: string;
  content: string;
  contentUpdatedAt: number;
  referencesUpdatedAt: number;
}

const db = createDb<Article>("./data/articles.json");

export const articlesRepository = {
  create: (title: string): Article => ({id: Date.now(), title: title, content: "", contentUpdatedAt: -1, referencesUpdatedAt: -1}),

  all: async () => await db.load(),

  findById: async (id: number) => {
    const articles = await db.load();

    return articles.find(x => x.id === id);
  },

  findByTitle: async (title: string) => {
    const articles = await db.load();

    return articles.find(x => x.title === title);
  },

  save: async (article: Article) => {
    let articles = await db.load();

    articles = articles.filter(a => a.id !== article.id);
    articles.push(article);

    await db.save(articles);
  }
}