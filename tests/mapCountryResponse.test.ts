import { describe, it, expect } from 'vitest';
import { mapCountryResponse } from '../src/api/mapCountryResponse.js';
import type { RawCountry } from '../src/types.js';

const belarusRaw: RawCountry = {
  name: 'Belarus',
  capital: 'Minsk',
  region: 'Europe',
  population: 9398861,
  flags: { png: 'https://flagcdn.com/w320/by.png', svg: 'https://flagcdn.com/by.svg' },
  languages: [
    { name: 'Belarusian', iso639_1: 'be' },
    { name: 'Russian', iso639_1: 'ru' },
  ],
  currencies: [{ code: 'BYN', name: 'New Belarusian ruble', symbol: 'Br' }],
  area: 207600,
  borders: ['LVA', 'LTU', 'POL', 'RUS', 'UKR'],
};

describe('mapCountryResponse', () => {
  it('маппит основные поля карточки', () => {
    const result = mapCountryResponse(belarusRaw);

    expect(result.name).toBe('Belarus');
    expect(result.capital).toBe('Minsk');
    expect(result.region).toBe('Europe');
    expect(result.population).toBe(9398861);
  });

  it('извлекает имена языков из массива объектов', () => {
    const result = mapCountryResponse(belarusRaw);

    expect(result.languages).toEqual(['Belarusian', 'Russian']);
  });

  it('берёт svg-флаг, если есть', () => {
    const result = mapCountryResponse(belarusRaw);

    expect(result.flagUrl).toBe('https://flagcdn.com/by.svg');
  });

  it('падает обратно на png, если svg нет', () => {
    const raw: RawCountry = {
      ...belarusRaw,
      flags: { png: 'https://flagcdn.com/w320/by.png' },
    };

    expect(mapCountryResponse(raw).flagUrl).toBe('https://flagcdn.com/w320/by.png');
  });

  it('возвращает пустую строку для флага, если flags нет', () => {
    const raw: RawCountry = { ...belarusRaw, flags: undefined, flag: undefined };

    expect(mapCountryResponse(raw).flagUrl).toBe('');
  });

  it('возвращает пустую строку для столицы, если capital нет', () => {
    const raw: RawCountry = { ...belarusRaw, capital: undefined };

    expect(mapCountryResponse(raw).capital).toBe('');
  });

  it('возвращает пустой массив языков, если languages нет', () => {
    const raw: RawCountry = { ...belarusRaw, languages: undefined };

    expect(mapCountryResponse(raw).languages).toEqual([]);
  });

  it('возвращает 0 для населения, если population нет', () => {
    const raw: RawCountry = { ...belarusRaw, population: undefined };

    expect(mapCountryResponse(raw).population).toBe(0);
  });

  it('возвращает пустую строку для региона, если region нет', () => {
    const raw: RawCountry = { ...belarusRaw, region: undefined };

    expect(mapCountryResponse(raw).region).toBe('');
  });

  it('не мутирует исходный объект', () => {
    const raw = structuredClone(belarusRaw);
    mapCountryResponse(raw);

    expect(raw).toEqual(belarusRaw);
  });
});
