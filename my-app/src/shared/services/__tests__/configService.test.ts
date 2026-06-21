import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '../configService';
import { get } from '@vercel/edge-config';

// Mock edge-config
vi.mock('@vercel/edge-config', () => ({
  get: vi.fn(),
}));

describe('ConfigService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset env variables
    delete process.env.EDGE_CONFIG_ID;
    delete process.env.VERCEL_ACCESS_TOKEN;
    delete process.env.EDGE_CONFIG;
  });

  describe('get', () => {
    it('nên trả về giá trị từ Vercel edge-config khi get thành công', async () => {
      const mockValue = 'mock-greeting-value';
      vi.mocked(get).mockResolvedValueOnce(mockValue);

      const result = await ConfigService.get<string>('greeting');
      expect(get).toHaveBeenCalledWith('greeting');
      expect(result).toBe(mockValue);
    });

    it('nên trả về undefined khi edge-config get ném ra lỗi', async () => {
      vi.mocked(get).mockRejectedValueOnce(new Error('Network Error'));

      const result = await ConfigService.get<string>('greeting');
      expect(get).toHaveBeenCalledWith('greeting');
      expect(result).toBeUndefined();
    });
  });

  describe('set', () => {
    it('nên trả về false và log lỗi nếu thiếu EDGE_CONFIG_ID và VERCEL_ACCESS_TOKEN', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await ConfigService.set('greeting', 'new-value');
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Thiếu EDGE_CONFIG_ID hoặc VERCEL_ACCESS_TOKEN để ghi')
      );
      consoleErrorSpy.mockRestore();
    });

    it('nên gọi API Vercel và trả về true khi cập nhật thành công', async () => {
      process.env.EDGE_CONFIG_ID = 'ecfg_123456';
      process.env.VERCEL_ACCESS_TOKEN = 'mock-token';

      const mockResponse = { ok: true, json: async () => ({}) };
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse as Response);

      const result = await ConfigService.set('greeting', 'new-value');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.vercel.com/v1/edge-config/ecfg_123456/items',
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              {
                operation: 'upsert',
                key: 'greeting',
                value: 'new-value',
              },
            ],
          }),
        })
      );
      expect(result).toBe(true);
      fetchSpy.mockRestore();
    });

    it('nên tự động trích xuất EDGE_CONFIG_ID từ EDGE_CONFIG url nếu không cấu hình EDGE_CONFIG_ID', async () => {
      process.env.EDGE_CONFIG = 'https://edge-config.vercel.com/ecfg_fromurl?token=xxx';
      process.env.VERCEL_ACCESS_TOKEN = 'mock-token';

      const mockResponse = { ok: true, json: async () => ({}) };
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse as Response);

      const result = await ConfigService.set('greeting', 'new-value');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.vercel.com/v1/edge-config/ecfg_fromurl/items',
        expect.any(Object)
      );
      expect(result).toBe(true);
      fetchSpy.mockRestore();
    });

    it('nên trả về false nếu API Vercel trả về lỗi', async () => {
      process.env.EDGE_CONFIG_ID = 'ecfg_123456';
      process.env.VERCEL_ACCESS_TOKEN = 'mock-token';

      const mockResponse = { ok: false, status: 400, json: async () => ({ error: 'Bad Request' }) };
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse as unknown as Response);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await ConfigService.set('greeting', 'new-value');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('API ghi thất bại:'),
        400,
        expect.any(Object)
      );
      
      fetchSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('nên trả về false và log lỗi nếu fetch ném ra ngoại lệ', async () => {
      process.env.EDGE_CONFIG_ID = 'ecfg_123456';
      process.env.VERCEL_ACCESS_TOKEN = 'mock-token';

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network timeout'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await ConfigService.set('greeting', 'new-value');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Lỗi khi ghi key "greeting":'),
        expect.any(Error)
      );

      fetchSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
