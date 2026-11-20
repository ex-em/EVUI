import { copyFile, glob, readFile, writeFile } from 'node:fs/promises';

const declarations = new URL('../dist/types/', import.meta.url);

// NodeNext resolves Button.vue.js to vue-tsc's Button.vue.d.ts.
for await (const filename of glob('components/**/*.d.ts', { cwd: declarations })) {
  const path = new URL(filename, declarations);
  const source = await readFile(path, 'utf8');
  const resolved = source.replace(/(from\s+['"]\.{1,2}\/[^'"]+\.vue)(['"])/g, '$1.js$2');
  if (resolved !== source) {
    await writeFile(path, resolved);
  }
}

await copyFile(
  new URL('public-types.d.ts', declarations),
  new URL('public-types.d.cts', declarations),
);
