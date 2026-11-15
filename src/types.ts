export interface RawLanguage {
  name: string;
  iso639_1?: string;
}

export interface RawCurrency {
  code: string;
  name: string;
  symbol?: string;
}

export interface RawCountry {
  name: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  flags?: { svg?: string; png?: string };
  flag?: string;
  languages?: RawLanguage[];
  currencies?: RawCurrency[];
  area?: number;
  borders?: string[];
  alpha3Code?: string;
  nativeName?: string;
}

export interface Country {
  name: string;
  flagUrl: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
}
