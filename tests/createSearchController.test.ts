import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSearchController } from '../src/app/createSearchController.js';
import type { RawCountry, SearchState } from '../src/types.js';

const countries: RawCountry[] = [
  { name: 'Spain', capital: 'Madrid', region: 'Europe', population: 47_000_000 },
];

describe('createSearchController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('пустой ввод → состояние idle, searchFn не вызывается', () => {
    const searchFn = vi.fn();
    const controller = createSearchController({ searchFn, debounceMs: 300 });
    const states: SearchState[] = [];
    controller.subscribe((s: SearchState) => states.push(s));

    controller.search('');

    vi.advanceTimersByTime(300);

    expect(searchFn).not.toHaveBeenCalled();
    expect(states.at(-1)).toMatchObject({ kind: 'idle' });
  });

  it('ввод → loading, затем success с результатами', async () => {
    const searchFn = vi.fn().mockResolvedValue(countries);
    const controller = createSearchController({ searchFn, debounceMs: 300 });
    const states: SearchState[] = [];
    controller.subscribe((s: SearchState) => states.push(s));

    controller.search('spain');
    vi.advanceTimersByTime(300);

    expect(states.at(-1)).toMatchObject({ kind: 'loading' });

    await vi.runAllTimersAsync();

    expect(states.at(-1)).toMatchObject({ kind: 'success', data: countries });
  });

  it('404 (пустой массив) → состояние empty', async () => {
    const searchFn = vi.fn().mockResolvedValue([]);
    const controller = createSearchController({ searchFn, debounceMs: 300 });
    const states: SearchState[] = [];
    controller.subscribe((s: SearchState) => states.push(s));

    controller.search('zzz');
    await vi.runAllTimersAsync();

    expect(states.at(-1)).toMatchObject({ kind: 'empty' });
  });

  it('HttpError → состояние error с сообщением', async () => {
    const { HttpError } = await import('../src/api/HttpError.js');
    const searchFn = vi.fn().mockRejectedValue(new HttpError(500, 'Internal Server Error'));
    const controller = createSearchController({ searchFn, debounceMs: 300 });
    const states: SearchState[] = [];
    controller.subscribe((s: SearchState) => states.push(s));

    controller.search('spain');
    await vi.runAllTimersAsync();

    expect(states.at(-1)).toMatchObject({ kind: 'error' });
    expect((states.at(-1) as { message: string }).message).toContain('500');
  });

  it('AbortError → состояние НЕ error (пользователю не показывается)', async () => {
    const searchFn = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    const controller = createSearchController({ searchFn, debounceMs: 300 });
    const states: SearchState[] = [];
    controller.subscribe((s: SearchState) => states.push(s));

    controller.search('spain');
    await vi.runAllTimersAsync();

    expect(states.at(-1)?.kind).not.toBe('error');
  });

  it('новый ввод отменяет предыдущий запрос (abort вызывается синхронно)', () => {
    const searchFn = vi.fn().mockReturnValue(new Promise(() => {})); // висит
    const controller = createSearchController({ searchFn, debounceMs: 300 });
    controller.subscribe(() => {});

    // 1. первый ввод → прокручиваем debounce, чтобы searchFn реально вызвался
    controller.search('sp');
    vi.advanceTimersByTime(300);

    expect(searchFn).toHaveBeenCalledTimes(1);
    const firstSignal = searchFn.mock.calls[0]?.[1] as AbortSignal;
    expect(firstSignal.aborted).toBe(false);

    // 2. второй ввод → abort должен сработать СИНХРОННО (до debounce)
    controller.search('spain');

    expect(firstSignal.aborted).toBe(true);
  });

  it('retry повторяет последний запрос', async () => {
    const searchFn = vi.fn().mockResolvedValue(countries);
    const controller = createSearchController({ searchFn, debounceMs: 300 });
    controller.subscribe(() => {});

    controller.search('spain');
    await vi.runAllTimersAsync();

    searchFn.mockClear();
    controller.retry();
    await vi.runAllTimersAsync();

    expect(searchFn).toHaveBeenCalledWith('spain', expect.any(AbortSignal));
  });
});
