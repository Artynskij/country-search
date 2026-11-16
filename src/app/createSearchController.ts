import { classifyError } from '../api/classifyError.js';
import { debounce } from '../lib/debounce.js';
import type { RawCountry, SearchState } from '../types.js';

export type SearchFn = (query: string, signal: AbortSignal) => Promise<RawCountry[]>;

export interface SearchControllerOptions {
  searchFn: SearchFn;
  debounceMs: number;
}

export interface SearchController {
  search(query: string): void;
  retry(): void;
  abort(): void;
  subscribe(listener: (state: SearchState) => void): () => void;
}

export function createSearchController({
  searchFn,
  debounceMs,
}: SearchControllerOptions): SearchController {
  const listeners = new Set<(state: SearchState) => void>();
  let state: SearchState = { kind: 'idle' };
  let activeController: AbortController | null = null;
  let lastQuery = '';

  function setState(next: SearchState): void {
    state = next;
    for (const listener of listeners) {
      listener(state);
    }
  }

  function abortActive(): void {
    if (activeController !== null) {
      activeController.abort();
      activeController = null;
    }
  }

  async function run(query: string): Promise<void> {
    abortActive();
    const controller = new AbortController();
    activeController = controller;

    setState({ kind: 'loading' });

    try {
      const data = await searchFn(query, controller.signal);
      if (controller.signal.aborted) return;
      setState(data.length === 0 ? { kind: 'empty' } : { kind: 'success', data });
    } catch (err) {
      if (controller.signal.aborted) return;
      const classified = classifyError(err);
      if (classified.kind === 'abort') return;
      setState({ kind: 'error', message: classified.message });
    } finally {
      if (activeController === controller) {
        activeController = null;
      }
    }
  }

  const debouncedRun = debounce((query: string) => {
    void run(query);
  }, debounceMs);

  function search(query: string): void {
    lastQuery = query;

    // отмена активного запроса — синхронно, при каждом вводе, до debounce
    abortActive();

    if (query.trim() === '') {
      debouncedRun.cancel();
      setState({ kind: 'idle' });
      return;
    }

    debouncedRun(query);
  }

  function retry(): void {
    if (lastQuery.trim() === '') return;
    void run(lastQuery);
  }

  function abort(): void {
    abortActive();
    debouncedRun.cancel();
  }

  function subscribe(listener: (state: SearchState) => void): () => void {
    listeners.add(listener);
    listener(state);
    return () => {
      listeners.delete(listener);
    };
  }

  return { search, retry, abort, subscribe };
}
