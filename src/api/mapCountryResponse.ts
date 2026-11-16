import type { Country, RawCountry } from '../types.js';

export function mapCountryResponse(raw: RawCountry): Country {
  return {
    name: raw.name,
    flagUrl: raw.flags?.svg ?? raw.flags?.png ?? '',
    capital: raw.capital ?? '',
    region: raw.region ?? '',
    population: raw.population ?? 0,
    languages: (raw.languages ?? []).map((lang) => lang.name),
  };
}
