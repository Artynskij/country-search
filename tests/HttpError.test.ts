import { describe, it, expect } from 'vitest';
import { HttpError } from '../src/api/HttpError.js';

describe('HttpError', () => {
  it('является экземпляром Error', () => {
    const err = new HttpError(500, 'Internal Server Error');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HttpError);
  });

  it('сохраняет статус ответа', () => {
    const err = new HttpError(503, 'Service Unavailable');

    expect(err.status).toBe(503);
  });

  it('сохраняет сообщение', () => {
    const err = new HttpError(500, 'boom');

    expect(err.message).toBe('boom');
  });
});
