import { createSearchController } from './app/createSearchController.js';
import { searchCountries } from './api/searchCountries.js';
import { buildShell } from './ui/shell.js';
import { renderState } from './ui/render.js';
import { renderDetail } from './ui/detail.js';
import type { RawCountry } from './types.js';

function main(): void {
  const { input, results } = buildShell();

  const controller = createSearchController({
    searchFn: searchCountries,
    debounceMs: 300,
  });

  const rawByName = new Map<string, RawCountry>();

  controller.subscribe((state) => {
    if (state.kind === 'success') {
      for (const raw of state.data) rawByName.set(raw.name, raw);
    }
    results.replaceChildren(
      renderState(state, {
        onRetry: () => controller.retry(),
        onSelect: (country) => {
          const raw = rawByName.get(country.name);
          if (!raw) return;
          const detail = renderDetail(raw, () => detail.remove());
          document.body.append(detail);
        },
      }),
    );
  });

  input.addEventListener('input', (e) => {
    controller.search((e.target as HTMLInputElement).value);
  });
}

main();
