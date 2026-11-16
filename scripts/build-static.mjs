import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });

await copyFile('styles.css', 'dist/styles.css');

const html = await readFile('index.html', 'utf8');
const fixed = html.replace('./dist/main.js', './main.js');
await writeFile('dist/index.html', fixed);
