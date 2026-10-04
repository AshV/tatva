import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { slugifyQuote, CHUNK_SIZE, seededShuffle } from 'wiz-theme';

export const getStaticPaths: GetStaticPaths = async () => {
  const rawQuotes = await getCollection('quotes');
  const shuffled = seededShuffle(rawQuotes, rawQuotes.length);
  const totalChunks = Math.ceil(shuffled.length / CHUNK_SIZE);
  const paths = [];

  for (let page = 1; page <= totalChunks; page++) {
    const start = (page - 1) * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    const chunkQuotes = shuffled.slice(start, end).map((q) => ({
      id: q.data.id,
      content: q.data.content,
      author: q.data.author,
      authorSlug: q.data.authorSlug,
      category: q.data.category,
      categorySlug: q.data.categorySlug,
      mood: q.data.mood,
      slug: slugifyQuote(q.data.content),
      tags: q.data.tags || [],
      sourceWork: q.data.sourceWork,
      explanation: q.data.explanation || q.data.story,
      practicalInsight: q.data.practicalInsight,
      reflectionPrompt: q.data.reflectionPrompt,
    }));

    paths.push({
      params: { page: String(page) },
      props: {
        quotes: chunkQuotes,
        page,
        totalChunks,
        totalQuotes: shuffled.length,
      },
    });
  }

  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  return new Response(JSON.stringify(props), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
