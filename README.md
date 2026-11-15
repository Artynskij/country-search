# Country Search

Живой поиск стран по имени через [countries.dev](https://countries.dev) с корректной отменой устаревших запросов (`AbortController`), debounce, обработкой ошибок (404 / HttpError / TimeoutError / AbortError) и TDD-подходом.

## Стек

- TypeScript (компиляция через `tsc` в ES-модули, подключение через `<script type="module">`)
- Vitest — тесты, fake timers, мок `fetch`
- ESLint + Prettier
- Husky: `pre-commit` → lint-staged, `pre-push` → `npm test`

## Документация

Архитектурные решения и обоснования — в [DESIGN.md](./DESIGN.md) (появится в ветке `country-search`).

## Статус

Разработка ведётся в ветке `country-search`. PR в `main` не мержится — сдаётся через cross-check.
