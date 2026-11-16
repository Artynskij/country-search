import { describe, it, expect, vi, afterEach } from 'vitest';
import { searchCountries } from '../src/api/searchCountries.js';

function mockFetch(response: Partial<Response>) {
  const fetchMock = vi.fn().mockResolvedValue(response as Response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('возвращает массив стран при 200', async () => {
    mockFetch({ ok: true, status: 200, json: async () => [{ name: 'Spain' }] } as Response);

    const result = await searchCountries('spain', new AbortController().signal);

    expect(result).toEqual([{ name: 'Spain' }]);
  });

  it('возвращает пустой массив при 404 (нет совпадений)', async () => {
    mockFetch({ ok: false, status: 404 } as Response);

    const result = await searchCountries('zzz', new AbortController().signal);

    expect(result).toEqual([]);
  });

  it('бросает HttpError со статусом при 500', async () => {
    mockFetch({ ok: false, status: 500, statusText: 'Internal Server Error' } as Response);

    await expect(searchCountries('spain', new AbortController().signal)).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
    });
  });

  it('пробрасывает AbortError при отмене', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      }),
    );

    const controller = new AbortController();
    const promise = searchCountries('spain', controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('пробрасывает TimeoutError при таймауте', async () => {
    vi.useFakeTimers();

    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Timeout', 'TimeoutError'));
          });
        });
      }),
    );

    const promise = searchCountries('spain', new AbortController().signal, 1000);
    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toMatchObject({ name: 'TimeoutError' });
  });
});
