import {createDb} from "./fileDb";
import {gpt} from "../gpt";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";

export type Chunk = { embedding: number[]; text: string; ref: string; }

const db = createDb<Chunk>("./data/full-text-index.json");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 50,
});

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

export const fullTextSearch = {
  update: async (ref: string, text: string) => {
    let chunks = await db.load();
    chunks = chunks.filter(x => x.ref !== ref);

    const documents = await splitter.createDocuments([text]);
    const paragraphs = documents.map(c => c.pageContent);

    for (const paragraph of paragraphs) {
      const embedding = await gpt.getEmbedding(paragraph);
      chunks.push({embedding, text: paragraph, ref});
    }

    await db.save(chunks);
  },

  find: async (text: string, options?: { excludeRefs?: string[], top?: number }) => {
    const top = options?.top ?? 10;
    const excludeRefs = options?.excludeRefs ?? [];

    let chunks = await db.load();

    const embedding = await gpt.getEmbedding(text);

    return chunks
      .filter(x => !excludeRefs.includes(x.ref))
      .map(x => ({text: x.text, similarity: cosineSimilarity(x.embedding, embedding)}))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, top)
      .map(r => r.text);
  },
}

