export interface Shell {
  input: HTMLInputElement;
  results: HTMLElement;
}

export function buildShell(): Shell {
  const header = document.createElement('header');
  header.className = 'header';

  const title = document.createElement('h1');
  title.textContent = 'Поиск стран';

  const input = document.createElement('input');
  input.className = 'search';
  input.type = 'search';
  input.placeholder = 'Начните вводить название…';
  input.autocomplete = 'off';
  input.setAttribute('aria-label', 'Поиск стран по названию');

  header.append(title, input);

  const results = document.createElement('main');
  results.className = 'results';
  results.setAttribute('aria-live', 'polite');

  document.body.append(header, results);
  return { input, results };
}
