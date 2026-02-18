/**
 * Unit: проверка SEO-карты статических роутов.
 * - Все записи STATIC_ROUTE_META имеют title и description.
 * - getStaticMeta() возвращает валидные данные для известных путей.
 * - Запрещено пустое description.
 */
import { describe, it, expect } from 'vitest';
import { STATIC_ROUTE_META, getStaticMeta } from './routes';

describe('STATIC_ROUTE_META', () => {
  it('all entries have non-empty title and description', () => {
    for (const [path, meta] of Object.entries(STATIC_ROUTE_META)) {
      expect(meta, `path "${path}"`).toHaveProperty('title');
      expect(meta, `path "${path}"`).toHaveProperty('description');
      expect(typeof meta.title).toBe('string');
      expect(typeof meta.description).toBe('string');
      expect(meta.title.trim(), `path "${path}" title must not be empty`).not.toBe('');
      expect(meta.description.trim(), `path "${path}" description must not be empty`).not.toBe('');
    }
  });

  it('no entry has relative canonical (we do not set canonical in routes)', () => {
    for (const [path, meta] of Object.entries(STATIC_ROUTE_META)) {
      if (meta.canonical !== undefined) {
        expect(meta.canonical.startsWith('http'), `path "${path}" canonical must be absolute if set`).toBe(true);
      }
    }
  });
});

describe('getStaticMeta', () => {
  it('returns valid meta for root path', () => {
    const meta = getStaticMeta('/');
    expect(meta).not.toBeNull();
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it('returns valid meta for empty path', () => {
    const meta = getStaticMeta('');
    expect(meta).not.toBeNull();
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it('returns valid meta for known static paths', () => {
    const paths = ['/o-kompanii', '/gotovye-potolki', '/catalog', '/potolki-v-spalnju'];
    for (const path of paths) {
      const meta = getStaticMeta(path);
      expect(meta, path).not.toBeNull();
      expect(meta.title?.trim(), path).not.toBe('');
      expect(meta.description?.trim(), path).not.toBe('');
    }
  });

  it('returns meta for gotovye-potolki subpaths (base path fallback)', () => {
    const meta = getStaticMeta('/gotovye-potolki/list/2');
    expect(meta).not.toBeNull();
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it('returns null for unknown path', () => {
    expect(getStaticMeta('/unknown-page-xyz')).toBeNull();
  });
});
