import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSearchController } from '../src/app/createSearchController.js';
import { searchCountries } from '../src/api/searchCountries.js';
import type { RawCountry, SearchState } from '../src/types.js';

const spain: RawCountry[] = [
  { name: 'Spain', capital: 'Madrid', region: 'Europe', population: 47_000_000 },
];
const sp: RawCountry[] = [
  { name: 'Spain (stale)', capital: 'Old', region: 'Europe', population: 1 },
];

describe('race: устаревшие ответы не перезаписывают актуальные', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('ответ на sp приходит позже, чем на spain — показывается только spain', async () => {
    let resolveSp: (v: RawCountry[]) => void;
    let resolveSpain: (v: RawCountry[]) => void;

    const spPromise = new Promise<RawCountry[]>((res) => {
      resolveSp = res;
    });
    const spainPromise = new Promise<RawCountry[]>((res) => {
      resolveSpain = res;
    });

    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      const isSp = url.endsWith('/sp');
      const isSpain = url.endsWith('/spain');

      const body = isSp
        ? spPromise
        : isSpain
          ? spainPromise
          : Promise.reject(new Error('unexpected url'));

      return new Promise<Response>((resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
        void body.then((data) =>
          resolve({
            ok: true,
            status: 200,
            json: async () => data,
          } as Response),
        );
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const controller = createSearchController({
      searchFn: (q, s) => searchCountries(q, s),
      debounceMs: 300,
    });
    const states: SearchState[] = [];
    controller.subscribe((s: SearchState) => states.push(s));

    controller.search('sp');
    vi.advanceTimersByTime(300);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/sp');

    controller.search('spain');
    vi.advanceTimersByTime(300);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('/spain');

    resolveSpain!(spain);
    await vi.runAllTimersAsync();

    resolveSp!(sp);
    await vi.runAllTimersAsync();

    expect(states.at(-1)).toMatchObject({ kind: 'success', data: spain });
    expect(
      states.some((s) => s.kind === 'success' && (s as { data: RawCountry[] }).data === sp),
    ).toBe(false);
  });
});
