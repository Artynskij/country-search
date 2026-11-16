import type { RawCountry } from '../types.js';

export function renderDetail(raw: RawCountry, onClose: () => void): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'detail-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const panel = document.createElement('div');
  panel.className = 'detail';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'detail__close';
  closeBtn.textContent = 'Закрыть';
  closeBtn.addEventListener('click', onClose);

  const title = document.createElement('h2');
  title.textContent = raw.name;

  panel.append(closeBtn, title);

  const rows: Array<[string, string]> = [
    ['Столица', raw.capital ?? '—'],
    ['Регион', raw.region ?? '—'],
    ['Субрегион', raw.subregion ?? '—'],
    ['Население', raw.population?.toLocaleString('ru-RU') ?? '—'],
    ['Площадь', raw.area ? `${raw.area.toLocaleString('ru-RU')} км²` : '—'],
    ['Границы', raw.borders?.length ? raw.borders.join(', ') : '—'],
    ['Языки', raw.languages?.map((l) => l.name).join(', ') || '—'],
    ['Валюта', raw.currencies?.map((c) => `${c.name} (${c.symbol ?? c.code})`).join(', ') || '—'],
  ];

  for (const [label, value] of rows) {
    const row = document.createElement('p');
    row.className = 'detail__row';
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    row.append(strong, document.createTextNode(value));
    panel.append(row);
  }

  overlay.append(panel);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });

  return overlay;
}
