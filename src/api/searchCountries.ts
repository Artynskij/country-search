import { HttpError } from './HttpError.js';
import type { RawCountry } from '../types.js';

const API_URL = 'https://countries.dev/name';

export async function searchCountries(
  query: string,
  signal: AbortSignal,
  timeoutMs = 5000,
): Promise<RawCountry[]> {
  const timeoutController = new AbortController();
  const timerId = setTimeout(() => {
    timeoutController.abort(new DOMException('Request timed out', 'TimeoutError'));
  }, timeoutMs);

  const combinedSignal = AbortSignal.any([signal, timeoutController.signal]);

  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(query)}`, {
      signal: combinedSignal,
    });

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }

    return (await response.json()) as RawCountry[];
  } finally {
    clearTimeout(timerId);
  }
}
