import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://michaelgurule.com',
    // Keep markup whitespace as written; collapsing it can shift inline layout
    compressHTML: false,
    build: {
        format: 'directory',
    },
    markdown: {
        // Code blocks in articles, colored to sit on the light page background
        shikiConfig: {
            theme: 'github-light',
        },
    },
});
