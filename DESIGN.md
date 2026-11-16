# DESIGN

## Отмена устаревших запросов

Живой поиск шлёт запрос на каждое изменение ввода. Ответ на `sp` может прийти позже, чем на `spain`, и перезаписать актуальный результат. Это гонка устаревших ответов.

Решаем через `AbortController`: перед новым запросом вызываем `abort()` у предыдущего, `fetch` отклоняется с `AbortError`, соединение закрывается. Флаг «актуальный ли ответ» не подходит — запрос всё равно висит в сети, а задание требует именно отмену.

`abort()` вызывается синхронно в `search()` при каждом вводе (`src/app/createSearchController.ts`), а не внутри debounce. Иначе за 300 мс ожидания старый ответ успеет отрендериться.

В `catch` различаем случаи (`src/api/classifyError.ts`): `AbortError` — своя отмена, молчим; `TimeoutError` — ошибка с повтором; `HttpError` — ошибка сервера с повтором; 404 — не ошибка, `searchCountries` возвращает `[]` → «ничего не найдено».

Таймаут — `AbortSignal.any([signal, timeoutController.signal])` в `src/api/searchCountries.ts`. Ручной `setTimeout` + `abort(new DOMException('Timeout', 'TimeoutError'))` вместо `AbortSignal.timeout`: поведение то же, но fake timers в тестах его перехватывают.

## Задержка debounce

300 мс. Без debounce — запрос на каждое нажатие, для `spain` пять запросов вместо одного. Слишком большая (1000+ мс) — поиск ощущается тормозным. 300 мс склеивает слово, но не воспринимается как задержка. Значение — параметр `debounceMs`.

## Сложность

`mapCountryResponse` — O(n), где n — число языков (единственный `map`). Остальные поля — O(1).

`classifyError` — O(1), фиксированное число проверок.

`debounce` — O(1) на вызов.

`createSearchController` — O(1) на `search`/`retry`/`abort`, O(k) на `setState` (k — подписчики), рендер — O(n) по странам.

## Чистый код

Разделение по слоям: `debounce` — только задержка; `searchCountries` — только HTTP; `mapCountryResponse` — только маппинг; `classifyError` — только классификация ошибок; `createSearchController` — оркестрация без DOM; `ui/render` и `ui/detail` — только DOM; `main.ts` — клей. Каждый слой тестируется отдельно.

Чистые функции: `mapCountryResponse` и `classifyError` — без побочных эффектов, тестируются без моков.

Иммутабельность: `mapCountryResponse` не мутирует вход (тест «не мутирует исходный объект»); `setState` заменяет состояние, а не мутирует.

Явные зависимости: `createSearchController({ searchFn, debounceMs })` — параметры, а не глобалы.

Без `innerHTML`: только `createElement`/`textContent` (`ui/render.ts`, `ui/detail.ts`).

Логика отмены не зависит от DOM → тестируется в Node. Мок `fetch` в `race.test.ts` реагирует на `signal` и отклоняется с `AbortError` — это отличает реальную отмену от игнорирования.
