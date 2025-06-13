export type Article = {
  id: number;
  title: string;
  content: string;
}

export const articlesApi = {
  getAll: async (): Promise<Article[]> => {
    const res = await fetch('/api/articles');

    if (!res.ok) throw new Error('Ошибка загрузки');
    return res.json();
  },

  create: async (): Promise<void> => {
    const res = await fetch('/api/articles/$update', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Ошибка загрузки');
    return res.json();
  }
}