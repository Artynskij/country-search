export type DebouncedFunction<Args extends unknown[]> = (...args: Args) => void;

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): DebouncedFunction<Args> {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      fn(...args);
    }, delay);
  };
}
