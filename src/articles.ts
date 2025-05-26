import fs from "node:fs/promises";

export type Article = {
  title: string,
  type: string,
  text: string
}

let cache: Article[] | undefined = undefined;
let loadPromise: Promise<Article[]> | undefined = undefined;

async function load(): Promise<Article[]> {
  if (cache) {
    return cache;
  }

  if (!loadPromise) {
    loadPromise = loadFromFile();
  }

  return loadPromise!;

  async function loadFromFile() {
    const fileData = await fs.readFile("../data/articles.json", {encoding: 'utf8'});
    return JSON.parse(fileData);
  }
}

async function save(articles: Article[]): Promise<void> {
  cache = articles;

  const jsonData = JSON.stringify(cache, null, 2);
  await fs.writeFile("../data/articles.json", jsonData, {encoding: 'utf8'});
}


export async function getArticles(titles: string[]): Promise<Article[]> {
  const articles = await load()

  return articles.filter(a => titles.some(t => a.title === t));
}


export async function getArticle(title: string): Promise<Article | null> {
  const articles = await load();

  return articles
    .filter(a => a.title === title)
    .reduce((result: Article | null, current) => {
      return {...current, text: current.text + "\n " + result?.text};
    }, null);
}

export async function updateArticle(article: Article): Promise<void> {
  let articles = await load();

  articles = articles.filter(a => a.title !== article.title);
  articles.push(article);

  await save(articles);
}