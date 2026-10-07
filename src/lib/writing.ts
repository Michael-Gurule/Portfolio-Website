import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'writing'>;

/** Newest first. Drafts show in `astro dev` and are left out of production builds. */
export async function getArticles(): Promise<Article[]> {
    const articles = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
    return articles.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// Frontmatter dates are calendar days, so format in UTC to avoid an off-by-one in western time zones
const dateFormat = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
});

export const formatDate = (date: Date) => dateFormat.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

const WORDS_PER_MINUTE = 230;

export function readingTime(markdown = ''): string {
    const text = markdown
        .replace(/```[\s\S]*?```/g, ' ') // code blocks
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // keep link text, drop URLs
        .replace(/<[^>]+>/g, ' ');
    const words = text.split(/\s+/).filter(word => /\w/.test(word)).length;
    return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
}
