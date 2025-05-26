import {gpt} from "./gpt";
import fs from "node:fs/promises";

type IndexItem = {
  key: number[],
  value: string
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

let cache: IndexItem[] | undefined = undefined;
let loadPromise: Promise<IndexItem[]> | undefined = undefined;

async function loadIndex(): Promise<IndexItem[]> {
  if (cache) {
    return cache;
  }

  if (!loadPromise) {
    loadPromise = loadFromFile();
  }

  return loadPromise;

  async function loadFromFile() {
    const fileData = await fs.readFile("../data/title-index.json", {encoding: 'utf8'});
    let data: IndexItem[] = JSON.parse(fileData);

    const titles = new Set();
    data = data.filter(i => {
      if (titles.has(i.value))
        return false;

      titles.add(i.value);
      return true;
    })

    return data;
  }
}

async function saveIndex(index: IndexItem[]): Promise<void> {
  cache = index;

  const jsonData = JSON.stringify(cache, null, 2);
  await fs.writeFile("../data/title-index.json", jsonData, {encoding: 'utf8'});
}


export async function findArticles(term: string, top = 10) {
  const index = await loadIndex();
  const embedding = await gpt.getEmbedding(term);

  return index
    .map(item => ({value: item.value, similarity: cosineSimilarity(item.key, embedding)}))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, top)
    .map(r => r.value);
}

export async function updateArticleIndex(title: string, text: string): Promise<void> {
  let index = await loadIndex();

  index = index.filter(i => i.value !== title);

  const titleEmbedding = await gpt.getEmbedding(title);
  index.push({key: titleEmbedding, value: title});

  const textEmbedding = await gpt.getEmbedding(text);
  index.push({key: textEmbedding, value: title});

  await saveIndex(index);
}