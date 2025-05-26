import {Bot} from "grammy";
import {gpt} from "./gpt";
import {findArticles, updateArticleIndex} from "./vector-search";
import {getArticle, getArticles, updateArticle} from "./articles";

const bot = new Bot(process.env.TELEGRAM_TOKEN!);

bot.api.setMyCommands([
  {command: "log", description: "Обновить историю приключений."},
]).catch(console.error);


// bot.command("quests", async (ctx) => {
//   const inlineKeyboard = new InlineKeyboard();
//
//   database.articles
//     .forEach((article, index) => {
//       if (article.type !== "quest") {
//         return;
//       }
//
//       inlineKeyboard.add({
//         text: article.title,
//         callback_data: `quests:${index}`
//       })
//       inlineKeyboard.row();
//     });
//
//   await ctx.reply("Выберите квест:", {reply_markup: inlineKeyboard});
// });
//
// bot.callbackQuery(/^quests:/, async (ctx) => {
//   const [_, questIndex] = ctx.callbackQuery.data.split(':');
//   if (!questIndex) {
//     return;
//   }
//
//   const quest = database.articles[parseInt(questIndex)];
//   if (!quest) {
//     return;
//   }
//
//   await ctx.reply(quest.text);
// });


bot.command("log", async (ctx) => {
  const log = (ctx.message?.text ?? '').slice(4);

  if (!log) {
    await ctx.reply("Что нового произошло?");
    return;
  }

  try {
    const titles = await findArticles(log);
    console.log(titles);

    let anyArticleUpdated = false;

    for (const title of titles) {
      const oldArticle = await getArticle(title);
      if (!oldArticle) {
        continue;
      }

      const isRelatedToArticle = await gpt.isRelatedToArticle(oldArticle, log);
      if (!isRelatedToArticle) {
        continue;
      }

      anyArticleUpdated = true;
      const newArticle = await gpt.updateArticle(oldArticle, log);

      console.log(oldArticle.text);
      console.log(newArticle.text);

      await updateArticle(newArticle);
      await updateArticleIndex(newArticle.title, newArticle.text);
    }

    if (!anyArticleUpdated) {
      const newArticle = await gpt.updateArticle({title: "", type: "", text: ""}, log);

      console.log(newArticle.text);

      await updateArticle(newArticle);
      await updateArticleIndex(newArticle.title, newArticle.text);
    }

    await ctx.reply("Информация обновлена.");
  } catch (error) {
    console.error("OpenAI error:", error);
    await ctx.reply("Ошибка при обращении к ИИ.");
  }
});

bot.on("message:text", async (ctx) => {
  const question = ctx.message?.text;

  if (!question) {
    await ctx.reply("И какой же у вас вопрос?");
    return;
  }

  try {
    const relatedTitles = await findArticles(question);
    console.log(relatedTitles);

    const articles = await getArticles(relatedTitles);

    const answer = await gpt.getAnswer(articles, question);

    await ctx.reply(answer);
  } catch (error) {
    console.error("OpenAI error:", error);
    await ctx.reply("Ошибка при обращении к ИИ.");
  }
});

async function main() {
  bot.catch(console.error);
  bot.start().catch(console.error);
}

main().catch(console.error);