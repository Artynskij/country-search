import { mapCountryResponse } from '../api/mapCountryResponse.js';
import type { Country, SearchState } from '../types.js';

export function renderState(
  state: SearchState,
  handlers: { onRetry: () => void; onSelect: (country: Country) => void },
): HTMLElement {
  switch (state.kind) {
    case 'idle':
      return el('div', { className: 'state state--idle' });
    case 'loading':
      return el('div', { className: 'state state--loading', role: 'status' }, [text('Загрузка…')]);
    case 'empty':
      return el('div', { className: 'state state--empty' }, [text('Ничего не найдено')]);
    case 'error':
      return el('div', { className: 'state state--error', role: 'alert' }, [
        text(state.message),
        el('button', { className: 'retry', onClick: handlers.onRetry }, [text('Повторить')]),
      ]);
    case 'success':
      return renderList(state.data.map(mapCountryResponse), handlers.onSelect);
  }
}

function renderList(countries: Country[], onSelect: (c: Country) => void): HTMLElement {
  const list = el('ul', { className: 'country-list' });
  for (const country of countries) {
    list.append(renderCard(country, onSelect));
  }
  return list;
}

function renderCard(country: Country, onSelect: (c: Country) => void): HTMLElement {
  const item = el('li', { className: 'country-card', tabIndex: 0 });

  const flag = country.flagUrl
    ? el('img', {
        className: 'country-card__flag',
        src: country.flagUrl,
        alt: `Флаг: ${country.name}`,
        loading: 'lazy',
      })
    : el('div', { className: 'country-card__flag country-card__flag--empty' });

  const body = el('div', { className: 'country-card__body' }, [
    el('h2', { className: 'country-card__name' }, [text(country.name)]),
    el('p', { className: 'country-card__row' }, [text(`Столица: ${country.capital || '—'}`)]),
    el('p', { className: 'country-card__row' }, [text(`Регион: ${country.region || '—'}`)]),
    el('p', { className: 'country-card__row' }, [
      text(`Население: ${country.population.toLocaleString('ru-RU')}`),
    ]),
  ]);

  item.append(flag, body);
  item.addEventListener('click', () => onSelect(country));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(country);
    }
  });

  return item;
}

type Attrs = {
  className?: string;
  role?: string;
  tabIndex?: number;
  src?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: Node[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (attrs.className) node.className = attrs.className;
  if (attrs.role) node.setAttribute('role', attrs.role);
  if (attrs.tabIndex !== undefined) node.tabIndex = attrs.tabIndex;
  if (attrs.src && node instanceof HTMLImageElement) node.src = attrs.src;
  if (attrs.alt && node instanceof HTMLImageElement) node.alt = attrs.alt;
  if (attrs.loading && node instanceof HTMLImageElement) node.loading = attrs.loading;
  if (attrs.onClick) node.addEventListener('click', attrs.onClick);
  for (const child of children) node.append(child);
  return node;
}

function text(value: string): Text {
  return document.createTextNode(value);
}
