import { rm, cp, mkdir } from 'node:fs/promises';
import { build } from 'vite';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
await build();
