import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../src/lib/debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('вызывает функцию один раз после задержки', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('сбрасывает таймер при повторном вызове', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    vi.advanceTimersByTime(200);
    debounced();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('передаёт аргументы последнего вызова', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('first');
    debounced('second');
    debounced('third');
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });
  it('cancel отменяет запланированный вызов', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    debounced.cancel();

    vi.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();
  });

  it('после cancel можно снова запланировать вызов', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    debounced.cancel();
    debounced('b');
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
  });
});
