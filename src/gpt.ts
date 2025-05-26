import {OpenAI} from "openai";

const defaultModel = "gpt-4.1-mini";

export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type Article = {
  title: string,
  type: string,
  text: string
}

export type Keyword = {
  title: string,
  type: string
}

export type Database = {
  articles: Article[];
}

export const gpt = {
  getKeywords: async (log: string): Promise<Keyword[]> => {
    const example = {
      keywords: [
        {title: "Убийство лося", type: "quest"},
        {title: "Лонливуд", type: "location"},
        {title: "Нимси Хадл", type: "character"},
        {title: "Вейлин", type: "character"}
      ]
    };

    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Пользователь отдаст информацию из нашей игры в ДНД.\n" +
            "Ты должен выделить список персонажей, локаций, предметов и заданий.\n" +
            "Пример JSON: " + JSON.stringify(example),
        },
        {
          role: "user",
          content: log
        }
      ],
      text: {format: {type: "json_object"}}
    });

    return JSON.parse(response.output_text).keywords;
  },

  getEmbedding: async (text: string): Promise<number[]> => {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  },

  getStory: async (database: Database, sessionLogs: string[]): Promise<string> => {
    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Пользователь отдаст новые факты для нашей текущей сессии в ДНД.\n" +
            "Ты должен сформировать историю текущей игровой сессии на основе новых фактов и информации из прошлых игр."
        },
        {
          role: "user",
          content: JSON.stringify(sessionLogs)
        },
        {
          role: "assistant",
          content: "Информация из прошлых игр: \n" + JSON.stringify(database)
        }
      ]
    });

    return response.output_text;
  },

  updateArticles: async (articles: Article[], log: string): Promise<Article[]> => {
    const example = {
      articles: [
        {
          title: "Лонливуд",
          type: "location",
          text: "Небольшой город. Спикер города - Нимси Хадл."
        },
        {
          title: "Нимси Хадл",
          type: "character",
          text: "Пожилая женщина-халфлинг. Спикер Лонливуда. Ей около 70 лет."
        },
        {
          title: "Угроза белого лося",
          type: "quest",
          text: "На город Лонливуд нападает белый лось. Нимси Хадл пообещала 100 золотых за его убийство."
        }
      ]
    };

    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Пользователь отдаст информацию из нашей игры в ДНД.\n" +
            "Ты должен дополнить статьи из прошлых игр новыми сведениями.\n" +
            "Если статьи отсутствуют, то нужно их добавить.\n" +
            "Если встречаются дубликаты статей, то нужно объединить информацию.\n" +
            "Результат вернуть в JSON формате:\n" + JSON.stringify(example)
        },
        {
          role: "user",
          content: log
        },
        {
          role: "assistant",
          content: "Статьи из прошлых игр: \n" + JSON.stringify(articles)
        }
      ],
      text: {format: {type: "json_object"}}
    });

    return JSON.parse(response.output_text).articles;
  },

  isRelatedToArticle: async (article: Article, log: string): Promise<boolean> => {
    const example = {
      result: true
    };

    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Пользователь отдаст информацию из нашей игры в ДНД.\n" +
            "Ты должен определить относятся ли новые сведения к существующей статье.\n" +
            "Результат вернуть в JSON формате:\n" + JSON.stringify(example)
        },
        {
          role: "user",
          content: log
        },
        {
          role: "assistant",
          content: "Статья из wiki по ДНД: \n" + JSON.stringify(article)
        }
      ],
      text: {format: {type: "json_object"}}
    });

    return JSON.parse(response.output_text).result;
  },

  updateArticle: async (article: Article, log: string): Promise<Article> => {
    const example = {
      title: "Лонливуд",
      type: "location",
      text: "Небольшой город. Спикер города - Нимси Хадл."
    };

    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Пользователь отдаст информацию из нашей игры в ДНД.\n" +
            "Ты должен дополнить статью новой информацией.\n" +
            "Результат вернуть в JSON формате:\n" + JSON.stringify(example)
        },
        {
          role: "user",
          content: log
        },
        {
          role: "assistant",
          content: "Статья из wiki по ДНД: \n" + JSON.stringify(article)
        }
      ],
      text: {format: {type: "json_object"}}
    });

    return JSON.parse(response.output_text);
  },

  getAnswer: async (articles: Article[], question: string): Promise<string> => {
    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Пользователь задаст вопрос о нашей игре в ДНД.\n" +
            "Ты должен ответить на вопрос на основе информации из прошлых игр."
        },
        {
          role: "user",
          content: question
        },
        {
          role: "assistant",
          content: "Статьи из прошлых игр: \n" + JSON.stringify(articles)
        }
      ]
    });

    return response.output_text;
  }
}