import { describe, it, expect, afterEach } from 'vitest';
import { isMockMode } from '../env';

describe('isMockMode', () => {
  const originalMock = process.env.NEXT_PUBLIC_MOCK_ENABLED;
  const originalApi = process.env.API_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_MOCK_ENABLED = originalMock;
    process.env.API_URL = originalApi;
  });

  it('true khi NEXT_PUBLIC_MOCK_ENABLED=true', () => {
    process.env.NEXT_PUBLIC_MOCK_ENABLED = 'true';
    process.env.API_URL = 'https://api.example.com';
    expect(isMockMode()).toBe(true);
  });

  it('true khi API_URL không set, bất kể flag mock', () => {
    delete process.env.NEXT_PUBLIC_MOCK_ENABLED;
    delete process.env.API_URL;
    expect(isMockMode()).toBe(true);
  });

  it('false khi API_URL set và flag không bật', () => {
    delete process.env.NEXT_PUBLIC_MOCK_ENABLED;
    process.env.API_URL = 'https://api.example.com';
    expect(isMockMode()).toBe(false);
  });

  it('false khi flag là chuỗi khác "true"', () => {
    process.env.NEXT_PUBLIC_MOCK_ENABLED = '1';
    process.env.API_URL = 'https://api.example.com';
    expect(isMockMode()).toBe(false);
  });
});
