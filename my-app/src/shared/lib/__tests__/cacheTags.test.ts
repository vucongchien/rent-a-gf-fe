import { describe, it, expect } from 'vitest';
import { CACHE_TAGS } from '../cacheTags';

describe('CACHE_TAGS', () => {
  it('expose companion builder + companions constants', () => {
    expect(CACHE_TAGS.COMPANIONS).toBe('companions');
    expect(CACHE_TAGS.COMPANIONS_LIST).toBe('companions-list');
    expect(CACHE_TAGS.companion('comp-123')).toBe('companion-comp-123');
  });

  it('KHÔNG export NOTIFICATIONS global (đã xoá vì leak risk per AGENTS.md)', () => {
    expect((CACHE_TAGS as Record<string, unknown>).NOTIFICATIONS).toBeUndefined();
  });

  it('builder companion(id) sinh tag khác nhau cho id khác nhau', () => {
    expect(CACHE_TAGS.companion('a')).not.toBe(CACHE_TAGS.companion('b'));
  });
});
