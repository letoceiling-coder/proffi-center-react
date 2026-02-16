/**
 * Копирует собранный фронтенд (frontend/dist/assets) в public/build/assets
 * для отдачи через Laravel (spa.blade.php).
 * Запуск: node scripts/copy-spa-build.js (из корня проекта).
 */

import { cpSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'frontend', 'dist', 'assets');
const dest = join(root, 'public', 'build', 'assets');

if (!existsSync(src)) {
  console.error('Сборка не найдена. Сначала выполните: cd frontend && npm run build');
  process.exit(1);
}

mkdirSync(dest, { recursive: true });

// Удалить старые index-*.js и index-*.css, чтобы не подхватывался устаревший билд
try {
  for (const name of readdirSync(dest)) {
    if (name.startsWith('index-') && (name.endsWith('.js') || name.endsWith('.css'))) {
      unlinkSync(join(dest, name));
    }
  }
} catch (_) {}

cpSync(src, dest, { recursive: true });
console.log('Скопировано frontend/dist/assets -> public/build/assets');
