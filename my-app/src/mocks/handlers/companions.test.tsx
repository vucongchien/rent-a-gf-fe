import React, { useEffect, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { companionHandlers } from './companions';

const server = setupServer(...companionHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

interface CompanionTestResponse {
  companions?: Array<{ companionId: string; displayName: string; availableCities: string[] }>;
  companionId?: string;
}

interface CompanionTestError {
  code: string;
}

// Component ảo để giả lập fetch từ frontend (JSDOM tự resolve base URL)
const FetcherComponent = ({ endpoint }: { endpoint: string }) => {
  const [data, setData] = useState<CompanionTestResponse | null>(null);
  const [error, setError] = useState<CompanionTestError | null>(null);

  useEffect(() => {
    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw res;
        return res.json();
      })
      .then(setData)
      .catch(async err => {
        const json = await err.json();
        setError(json);
      });
  }, [endpoint]);

  if (error) return <div data-testid="error">{error.code}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div data-testid="result">
      <span data-testid="item-count">{data.companions?.length || 0}</span>
      <span data-testid="first-city">{data.companions?.[0]?.availableCities?.[0]}</span>
      <span data-testid="detail-id">{data.companionId}</span>
    </div>
  );
};

describe('Companion Handlers (JSDOM wrapper)', () => {
  it('GET /api/companions returns a paginated list of companions', async () => {
    render(<FetcherComponent endpoint="/api/companions?page=1" />);
    
    await waitFor(() => {
      // Limit trong mock base là 6
      expect(screen.getByTestId('item-count')).toHaveTextContent('6');
    });
  });

  it('GET /api/companions filters by city correctly', async () => {
    render(<FetcherComponent endpoint="/api/companions?city=TP.HCM" />);
    
    await waitFor(() => {
      // First item should be from HCM
      expect(screen.getByTestId('first-city')).toHaveTextContent('TP.HCM');
    });
  });

  it('GET /api/companions/:companionId returns details', async () => {
    render(<FetcherComponent endpoint="/api/companions/comp-1" />);
    
    await waitFor(() => {
      // Detail returns a single object, not items array
      expect(screen.getByTestId('detail-id')).toHaveTextContent('comp-1');
    });
  });

  it('GET /api/companions/:companionId returns 404 for unknown id', async () => {
    render(<FetcherComponent endpoint="/api/companions/unknown-id-123" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('NOT_FOUND');
    });
  });
});
