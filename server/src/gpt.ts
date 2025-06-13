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

export const gpt = {

  getEmbedding: async (text: string): Promise<number[]> => {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  },


  createStory: async (log: string, dataChunks: string[]): Promise<string> => {
    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Ты — помощник в создании базы знаний игры в D&D, который превращает разрозненные заметки игроков в единую историю. " +
            "Пиши в стиле статьи, не выдумывай события, которых не было в заметках. Сохраняй диалоги и ключевые решения." +
            "Не используй Markdown."
        },
        {
          role: "user",
          content: `Обработай заметки: '${log}'`
        },
        {
          role: "assistant",
          content: `Дополнительные сведения о мире: '${JSON.stringify(dataChunks)}'`
        }
      ]
    });

    return response.output_text;
  },

  createTitle: async (story: string) => {
    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Ты — помощник в создании базы знаний игры в D&D, который должен дать название статье. " +
            "Например: 'Кобольды в шахте Термалина'"
        },
        {
          role: "user",
          content: `Дай название статье: '${story}'`
        }
      ]
    });

    return response.output_text;
  },

  getCharacters: async (story: string): Promise<string[]> => {
    const example = {characters: ["Нимси Хадл", "Отец Март", "Аурил"]};

    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Ты — помощник в создании базы знаний игры в D&D, который должен выделить действующих персонажей из истории." +
            "Ответ должен быть в формате JSON как в примере: " + JSON.stringify(example),
        },
        {
          role: "user",
          content: `Выдели действующих персонажей из истории: '${story}'`
        }
      ],
      text: {format: {type: "json_object"}}
    });

    return JSON.parse(response.output_text).characters;
  },


  createArticle: async (title: string, dataChunks: string[]): Promise<string> => {
    const response = await client.responses.create({
      model: defaultModel,
      input: [
        {
          role: "system",
          content:
            "Ты — помощник в создании базы знаний игры в D&D, который должен написать статью о персонаже исходя из имеющихся сведений. " +
            "Пиши в стиле статьи, не выдумывай события, которых не было. Сохраняй диалоги и ключевые решения." +
            "Не используй Markdown."
        },
        {
          role: "user",
          content: `Собери статью о персонаже: '${title}'`
        },
        {
          role: "assistant",
          content: `Сведения о мире: '${JSON.stringify(dataChunks)}'`
        }
      ]
    });

    return response.output_text;
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

  getAnswer: async (question: string, dataChunks: string[]): Promise<string> => {
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
          content: "Статьи из прошлых игр: \n" + JSON.stringify(dataChunks)
        }
      ]
    });

    return response.output_text;
  }
}