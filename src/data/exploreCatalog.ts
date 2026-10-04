import { getCollection } from 'astro:content';

export interface CategorySummary {
  name: string;
  slug: string;
  count: number;
}

export interface AuthorSummary {
  name: string;
  slug: string;
  count: number;
}

export interface ExploreCatalogData {
  totalQuotesCount: number;
  moodCounts: Record<string, number>;
  categoryCounts: Record<string, CategorySummary>;
  authorCounts: Record<string, AuthorSummary>;
  tagCounts: Record<string, number>;
  categories: CategorySummary[];
  totalAuthorsCount: number;
  totalTagsCount: number;
  allAuthors: AuthorSummary[];
  popularTags: [string, number][];
}

let _cachedExploreData: ExploreCatalogData | null = null;

export async function getExploreCatalog(): Promise<ExploreCatalogData> {
  if (_cachedExploreData) {
    return _cachedExploreData;
  }

  const allQuotes = await getCollection('quotes');

  const moodCounts: Record<string, number> = {};
  const categoryCounts: Record<string, CategorySummary> = {};
  const authorCounts: Record<string, AuthorSummary> = {};
  const tagCounts: Record<string, number> = {};

  for (const q of allQuotes) {
    const d = q.data;
    moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1;
    if (!categoryCounts[d.categorySlug]) {
      categoryCounts[d.categorySlug] = { name: d.category, slug: d.categorySlug, count: 0 };
    }
    categoryCounts[d.categorySlug].count++;
    if (!authorCounts[d.authorSlug]) {
      authorCounts[d.authorSlug] = { name: d.author, slug: d.authorSlug, count: 0 };
    }
    authorCounts[d.authorSlug].count++;
    for (const t of (d.tags || [])) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
  }

  const categories = Object.values(categoryCounts).sort((a, b) => b.count - a.count);
  const totalQuotesCount = allQuotes.length;
  const totalAuthorsCount = Object.keys(authorCounts).length;
  const totalTagsCount = Object.keys(tagCounts).length;
  const allAuthors = Object.values(authorCounts).sort((a, b) => b.count - a.count);
  const popularTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 40);

  _cachedExploreData = {
    totalQuotesCount,
    moodCounts,
    categoryCounts,
    authorCounts,
    tagCounts,
    categories,
    totalAuthorsCount,
    totalTagsCount,
    allAuthors,
    popularTags,
  };

  return _cachedExploreData;
}
