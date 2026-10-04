import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { categoryProfiles, getCategoryProfile } from '../../../data/categoryProfiles';

export const getStaticPaths: GetStaticPaths = async () => {
  const allQuotes = await getCollection('quotes');
  const catCounts: Record<string, number> = {};
  const catNames: Record<string, string> = {};

  allQuotes.forEach((q) => {
    const slug = q.data.categorySlug;
    catCounts[slug] = (catCounts[slug] || 0) + 1;
    if (!catNames[slug]) catNames[slug] = q.data.category;
  });

  const allSlugs = [...new Set([...Object.keys(categoryProfiles), ...Object.keys(catCounts)])];

  return allSlugs.map((slug) => {
    const prof = getCategoryProfile(slug, catNames[slug]);
    const profileData = {
      ...prof,
      count: catCounts[slug] || 0,
    };

    return {
      params: { slug },
      props: { profile: profileData },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  return new Response(JSON.stringify(props.profile), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
