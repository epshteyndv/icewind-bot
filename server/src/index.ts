import express from 'express';
import {articlesRepository} from "./db/articlesRepository";
import {Log, logsRepository} from "./db/logsRepository";
import {gpt} from "./gpt";
import {fullTextSearch} from "./db/fullTextSearch";
import {runBot} from "./bot";

const app = express();
const port = process.env.PORT || 3000;
const staticFilesPath = './wwwroot';

app.use(express.json());
app.use(express.static(staticFilesPath));

// --- Articles ---

app.get('/api/articles', async (_req, res) => {
  const articles = await articlesRepository.all();

  res.json(articles);
});

app.get('/api/articles/:id', async (_req, res) => {
  const article = await articlesRepository.findById(parseInt(_req.params.id));

  if (!article) {
    res.status(404).json({message: 'Not Found'});
    return;
  }

  res.json(article);
});

app.post('/api/articles/$update', async (_req, res) => {
  const articles = await articlesRepository.all();

  for (const article of articles) {
    if (article.contentUpdatedAt >= article.referencesUpdatedAt)
      continue;

    const dataChunks = await fullTextSearch.find(article.title);

    article.content = await gpt.createArticle(article.title, dataChunks);
    article.contentUpdatedAt = Date.now();

    await articlesRepository.save(article);
  }

  res.json();
})

// --- LOGS ---

app.get('/api/logs', async (_req, res) => {
  const logs = await logsRepository.all();
  res.json(logs);
});

app.get('/api/logs/:id', async (_req, res) => {
  const log = await logsRepository.findById(parseInt(_req.params.id));

  if (!log) {
    res.status(404).json({message: 'Not Found'});
    return;
  }

  res.json(log);
});

app.post('/api/logs', async (_req, res) => {
  const command = _req.body as { raw: string };

  const log = logsRepository.create(command.raw);

  await buildLogStory(log);
  await buildLogTitle(log);

  await logsRepository.save(log);
  await fullTextSearch.update(`log-story-${log.id}`, log.story);

  for (const character of log.characters) {
    await addOrUpdateArticle(character);
  }

  res.json(log);
});

app.put('/api/logs/:id', async (_req, res) => {
  const command = _req.body as { raw: string, title: string };
  const log = await logsRepository.findById(parseInt(_req.params.id));

  if (!log) {
    res.status(404).json({message: 'Not Found'});
    return;
  }

  if (command.raw !== log.raw) {
    log.raw = command.raw;
    await buildLogStory(log);
  }

  if (command.title !== log.title) {
    log.title = command.title;
  }

  await logsRepository.save(log);
  await fullTextSearch.update(`log-story-${log.id}`, log.story);

  for (const character of log.characters) {
    await addOrUpdateArticle(character);
  }

  res.json(log);
});


async function buildLogStory(log: Log) {
  const dataChunks = await fullTextSearch.find(log.raw, {excludeRefs: [`log-story-${log.id}`]});
  console.log(dataChunks);

  let story = await gpt.createStory(log.raw, dataChunks);
  let characters = await gpt.getCharacters(log.raw);

  log.story = story;
  log.characters = characters;
}

async function buildLogTitle(log: Log) {
  log.title = await gpt.createTitle(log.story);
}

async function addOrUpdateArticle(title: string) {
  let article = await articlesRepository.findByTitle(title);
  if (!article) {
    article = articlesRepository.create(title);
  }

  article.referencesUpdatedAt = Date.now();
  await articlesRepository.save(article);
}


// --- Static content ---
app.get('*args', (_req, res) => {
  res.sendFile('index.html', {root: staticFilesPath});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// --- Bot ---
runBot().catch(console.error);