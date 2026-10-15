// Generates an article hero image in the site style: grid paper, a red curve, a mono label, and a serif title.
//
// Usage:
//   npm run hero -- <slug> [--title "Shorter title"] [--label "Category"] [--seed 7]
//
// <slug> is the article filename without .md. The title defaults to the article title up to its first
// colon, and the label to the article's first tag. Each slug draws its own curve; pass --seed to try
// another. Output goes to the article's existing `hero:` path, or to ./images/<slug>/hero.png, which
// is then added to the frontmatter.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const WIDTH = 1600;
const HEIGHT = 900;
const COLORS = { canvas: '#F7F8FA', rule: '#E5E7EB', ink: '#111418', muted: '#8A93A0', accent: '#EA4F3D' };

const writingDir = path.resolve(import.meta.dirname, '../src/content/writing');

function parseArgs(argv) {
    const [slug, ...rest] = argv;
    const opts = {};
    for (let i = 0; i < rest.length; i += 2) {
        if (!rest[i].startsWith('--') || rest[i + 1] === undefined) throw new Error(`Bad option: ${rest[i]}`);
        opts[rest[i].slice(2)] = rest[i + 1];
    }
    return { slug, ...opts };
}

// Just enough YAML for the fields this script reads
function frontmatterField(source, key) {
    const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    if (!match) return undefined;
    const value = match[1].replace(/\s+#.*$/, '').trim();
    if (value.startsWith('[')) {
        return value.slice(1, -1).split(',').map(tag => tag.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    return value.replace(/^["']|["']$/g, '');
}

function hashSeed(text) {
    let hash = 0;
    for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
    return hash / 997;
}

function wrap(text, maxChars) {
    const lines = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
        if (line && (line + ' ' + word).length > maxChars) {
            lines.push(line);
            line = word;
        } else {
            line = line ? `${line} ${word}` : word;
        }
    }
    return [...lines, line];
}

const escapeXml = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function heroSvg({ title, label, seed }) {
    const grid = [];
    for (let x = 0; x <= WIDTH; x += 80) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}"/>`);
    for (let y = 0; y <= HEIGHT; y += 80) grid.push(`<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}"/>`);

    // Two overlaid waves; the seed shifts their period and phase so every article gets its own line
    const points = [];
    for (let x = 0; x <= WIDTH; x += 20) {
        const y = 600 - 140 * Math.sin(x / (230 + seed * 40) + seed) - 60 * Math.cos(x / 97 + seed * 2);
        points.push(`${x},${y.toFixed(1)}`);
    }

    const titleLines = wrap(title, 34);
    if (titleLines.length > 3) console.warn(`Title wraps to ${titleLines.length} lines; consider a shorter --title.`);
    const titleSvg = titleLines
        .map((line, i) => `<text x="120" y="${250 + i * 78}" font-family="Georgia, serif" font-size="64" font-weight="600" fill="${COLORS.ink}">${escapeXml(line)}</text>`)
        .join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
<rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.canvas}"/>
<g stroke="${COLORS.rule}" stroke-width="1">${grid.join('')}</g>
<polyline points="${points.join(' ')}" fill="none" stroke="${COLORS.accent}" stroke-width="4"/>
<text x="120" y="150" font-family="Menlo, monospace" font-size="24" letter-spacing="3" fill="${COLORS.muted}">${escapeXml(label.toUpperCase())}</text>
${titleSvg}
</svg>`;
}

const args = parseArgs(process.argv.slice(2));
if (!args.slug) {
    console.error('Usage: npm run hero -- <slug> [--title "..."] [--label "..."] [--seed 7]');
    process.exit(1);
}

const articlePath = path.join(writingDir, `${args.slug}.md`);
let source = readFileSync(articlePath, 'utf8');

const title = args.title ?? frontmatterField(source, 'title').split(':')[0];
const label = args.label ?? frontmatterField(source, 'tags')?.[0] ?? 'Writing';
const seed = args.seed !== undefined ? Number(args.seed) : hashSeed(args.slug);
const heroPath = frontmatterField(source, 'hero') ?? `./images/${args.slug}/hero.png`;

const outFile = path.resolve(writingDir, heroPath);
mkdirSync(path.dirname(outFile), { recursive: true });
await sharp(Buffer.from(heroSvg({ title, label, seed }))).png().toFile(outFile);
console.log(`Wrote ${path.relative(process.cwd(), outFile)}  (title: "${title}", label: "${label}", seed: ${seed.toFixed(3)})`);

if (!frontmatterField(source, 'hero')) {
    // Insert before the closing frontmatter fence, keeping draft as the last field when present
    source = source.replace(/^(---\n[\s\S]*?)(\ndraft:.*)?\n---\n/, (_, head, draft = '') =>
        `${head}\nhero: ${heroPath}\nheroAlt: ""${draft}\n---\n`);
    writeFileSync(articlePath, source);
    console.log(`Added hero to ${path.relative(process.cwd(), articlePath)}; fill in heroAlt.`);
}
