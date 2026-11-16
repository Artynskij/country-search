export type DebouncedFunction<Args extends unknown[]> = {
  (...args: Args): void;
  cancel(): void;
};

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): DebouncedFunction<Args> {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Args): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      fn(...args);
    }, delay);
  };

  debounced.cancel = (): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}
