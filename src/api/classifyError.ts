import { HttpError } from './HttpError.js';

export type ErrorKind = 'abort' | 'timeout' | 'http' | 'unknown';

export interface ClassifiedError {
  kind: ErrorKind;
  message: string;
  status?: number;
}

export function classifyError(err: unknown): ClassifiedError {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return { kind: 'abort', message: '' };
  }

  if (err instanceof DOMException && err.name === 'TimeoutError') {
    return { kind: 'timeout', message: 'Превышено время ожидания' };
  }

  if (err instanceof HttpError) {
    return {
      kind: 'http',
      message: `Ошибка сервера (${err.status})`,
      status: err.status,
    };
  }

  return { kind: 'unknown', message: 'Что-то пошло не так' };
}
