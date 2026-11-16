import { describe, it, expect } from 'vitest';
import { classifyError } from '../src/api/classifyError.js';
import { HttpError } from '../src/api/HttpError.js';

describe('classifyError', () => {
  it('AbortError → kind abort (не показывать пользователю)', () => {
    const err = new DOMException('Aborted', 'AbortError');

    expect(classifyError(err).kind).toBe('abort');
  });

  it('TimeoutError → kind timeout с сообщением', () => {
    const err = new DOMException('Timeout', 'TimeoutError');

    const result = classifyError(err);

    expect(result.kind).toBe('timeout');
    expect(result.message).toMatch(/врем/i);
  });

  it('HttpError → kind http с сообщением и статусом', () => {
    const err = new HttpError(500, 'Internal Server Error');

    const result = classifyError(err);

    expect(result.kind).toBe('http');
    expect(result.status).toBe(500);
    expect(result.message).toContain('500');
  });

  it('обычная Error → kind unknown', () => {
    const err = new Error('network down');

    const result = classifyError(err);

    expect(result.kind).toBe('unknown');
  });

  it('не-Error значение → kind unknown', () => {
    expect(classifyError('string error').kind).toBe('unknown');
  });
});
