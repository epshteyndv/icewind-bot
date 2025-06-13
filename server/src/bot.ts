import {Bot} from "grammy";
import {gpt} from "./gpt";
import {fullTextSearch} from "./db/fullTextSearch";

const bot = new Bot(process.env.TELEGRAM_TOKEN!);

bot.api.setMyCommands([
  // {command: "log", description: "Обновить историю приключений."},
]).catch(console.error);

// bot.command("log", async (ctx) => {
//   const log = (ctx.message?.text ?? '').slice(4);
//
//   if (!log) {
//     await ctx.reply("Что нового произошло?");
//     return;
//   }
//
//   try {
//     const titles = await articlesIndex.find(log);
//     console.log(titles);
//
//     let anyArticleUpdated = false;
//
//     for (const title of titles) {
//       const oldArticle = await articlesRepository.getByTitle(title);
//       if (!oldArticle) {
//         continue;
//       }
//
//       const isRelatedToArticle = await gpt.isRelatedToArticle(oldArticle, log);
//       if (!isRelatedToArticle) {
//         continue;
//       }
//
//       anyArticleUpdated = true;
//       const newArticle = await gpt.updateArticle(oldArticle, log);
//
//       console.log(oldArticle.text);
//       console.log(newArticle.text);
//
//       await articlesRepository.save(newArticle);
//       await articlesIndex.update(newArticle);
//     }
//
//     if (!anyArticleUpdated) {
//       const newArticle = await gpt.updateArticle({title: "", type: "", text: ""}, log);
//
//       console.log(newArticle.text);
//
//       await articlesRepository.save(newArticle);
//       await articlesIndex.update(newArticle);
//     }
//
//     await ctx.reply("Информация обновлена.");
//   } catch (error) {
//     console.error("OpenAI error:", error);
//     await ctx.reply("Ошибка при обращении к ИИ.");
//   }
// });

bot.on("message:text", async (ctx) => {
  const question = ctx.message?.text;

  if (!question) {
    await ctx.reply("И какой же у вас вопрос?");
    return;
  }

  try {
    const dataChunks = await fullTextSearch.find(question);
    const answer = await gpt.getAnswer(question, dataChunks);

    await ctx.reply(answer);
  } catch (error) {
    console.error("OpenAI error:", error);
    await ctx.reply("Ошибка при обращении к ИИ.");
  }
});

export async function runBot() {
  bot.catch(console.error);
  bot.start().catch(console.error);
}
