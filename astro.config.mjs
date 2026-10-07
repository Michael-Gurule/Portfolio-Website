import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://michaelgurule.com',
    // Keep markup whitespace as written; collapsing it can shift inline layout
    compressHTML: false,
    build: {
        format: 'directory',
    },
});
