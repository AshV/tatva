import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { loadAuthorProfiles, getAuthorProfile } from 'wisdom';

export const getStaticPaths: GetStaticPaths = async () => {
  const allQuotes = await getCollection('quotes');
  const authorCounts: Record<string, number> = {};
  const authorNames: Record<string, string> = {};

  allQuotes.forEach((q) => {
    const slug = q.data.authorSlug;
    authorCounts[slug] = (authorCounts[slug] || 0) + 1;
    if (!authorNames[slug]) authorNames[slug] = q.data.author;
  });

  const authorProfiles = loadAuthorProfiles();
  const allSlugs = [...new Set([...Object.keys(authorProfiles), ...Object.keys(authorCounts)])];

  return allSlugs.map((slug) => {
    const prof = getAuthorProfile(slug, authorNames[slug], 'hi');
    const profileData = {
      ...prof,
      count: authorCounts[slug] || 0,
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
