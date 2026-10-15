import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeFigure from './src/lib/rehype-figure.ts';

export default defineConfig({
    site: 'https://michaelgurule.com',
    // Keep markup whitespace as written; collapsing it can shift inline layout
    compressHTML: false,
    build: {
        format: 'directory',
    },
    markdown: {
        // unified (remark/rehype) rather than the default Sätteri, which parses math but can't render it.
        // $inline$ and $$display$$ math become KaTeX HTML at build time; its stylesheet loads on article pages.
        processor: unified({
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex, rehypeFigure],
        }),
        // Code blocks in articles, colored to sit on the light page background
        shikiConfig: {
            theme: 'github-light',
        },
    },
});
