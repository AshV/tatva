import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { slugifyQuote, CHUNK_SIZE, seededShuffle } from 'wisdom';

export const GET: APIRoute = async () => {
  const rawQuotes = await getCollection('quotes');
  const shuffled = seededShuffle(rawQuotes, rawQuotes.length);
  const totalChunks = Math.ceil(shuffled.length / CHUNK_SIZE);

  const chunks: number[] = new Array(rawQuotes.length + 1).fill(0);
  const quotes: Record<string, number> = {};
  const slugs: Record<string, number> = {};

  shuffled.forEach((q, idx) => {
    const chunkPage = Math.floor(idx / CHUNK_SIZE) + 1;
    const num = parseInt(q.data.id.replace(/\D/g, ''), 10);
    if (!isNaN(num)) {
      chunks[num] = chunkPage;
    }
    quotes[q.data.id.toLowerCase()] = chunkPage;
    const slug = slugifyQuote(q.data.content);
    if (slug) {
      slugs[slug.toLowerCase()] = chunkPage;
    }
  });

  const payload = {
    totalQuotes: rawQuotes.length,
    totalChunks,
    chunkSize: CHUNK_SIZE,
    chunks,
    quotes,
    slugs,
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
