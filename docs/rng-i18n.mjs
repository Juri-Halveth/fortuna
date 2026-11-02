// Presentation only. Input grammar and experiment values stay identical in every language.
const LOCALES = {de: 'de-DE', en: 'en-US', ru: 'ru-RU'};
const COPY = {
  de: {
    title: 'FORTUNA · Wahrscheinlichkeiten erproben',
    running: 'Lokale Ziehungen laufen …',
    baseline: 'Ausgangschance', proposed: 'Szenario',
    invalidProbability: 'Chance als Dezimalzahl von 0 bis 1 mit höchstens neun Nachkommastellen eingeben.',
    invalidDraws: 'Ziehungen als Ganzzahl von 1 bis 999999 eingeben.',
    noCrypto: 'Sichere Browser-Zufallsquelle nicht verfügbar.',
    invalidRandom: 'Ungültiger Zufallswert.',
    excessRejects: 'Zufallsquelle liefert zu viele verworfene Werte.',
    unknownError: 'Der Versuch konnte nicht ausgeführt werden.',
    cancelled: 'Versuch abgebrochen; keine Ergebnisbehauptung.',
  },
  en: {
    title: 'FORTUNA · Explore probabilities',
    running: 'Running local draws …',
    baseline: 'Baseline chance', proposed: 'Scenario',
    invalidProbability: 'Enter a decimal probability from 0 to 1 with at most nine decimal places.',
    invalidDraws: 'Enter an integer draw count from 1 to 999999.',
    noCrypto: 'Secure browser randomness is unavailable.',
    invalidRandom: 'Invalid random value.',
    excessRejects: 'The random source produced too many rejected values.',
    unknownError: 'The experiment could not run.',
    cancelled: 'Experiment cancelled; no result is claimed.',
  },
  ru: {
    title: 'FORTUNA · Исследование вероятностей',
    running: 'Идут локальные испытания …',
    baseline: 'Исходная вероятность', proposed: 'Сценарий',
    invalidProbability: 'Введите вероятность десятичным числом от 0 до 1, не более девяти знаков после точки.',
    invalidDraws: 'Введите целое число испытаний от 1 до 999999.',
    noCrypto: 'Безопасный генератор случайных чисел браузера недоступен.',
    invalidRandom: 'Недопустимое случайное значение.',
    excessRejects: 'Генератор случайных чисел выдал слишком много отклонённых значений.',
    unknownError: 'Не удалось выполнить эксперимент.',
    cancelled: 'Эксперимент прерван; результат не заявляется.',
  },
};
const ERROR_KEYS = {
  INVALID_PROBABILITY: 'invalidProbability', INVALID_DRAWS: 'invalidDraws',
  NO_CRYPTO: 'noCrypto', INVALID_RANDOM: 'invalidRandom', EXCESS_REJECTS: 'excessRejects',
};

export const rngLanguage = value => Object.hasOwn(LOCALES, value) ? value : 'de';
export const rngCopy = (language, key) => COPY[rngLanguage(language)][key];
const number = (language, value, options) => new Intl.NumberFormat(LOCALES[rngLanguage(language)], options).format(value);
const percent = (language, ratio, digits) => number(language, ratio * 100, {maximumFractionDigits: digits});

export function progressText(language, phase, completed, total, hits) {
  const lang = rngLanguage(language), label = rngCopy(lang, phase === 'baseline' ? 'baseline' : 'proposed');
  const count = `${number(lang, completed)} / ${number(lang, total)}`;
  if (lang === 'en') return `${label} · ${count} draws · ${number(lang, hits)} hits in this series`;
  if (lang === 'ru') return `${label} · ${count} испытаний · ${number(lang, hits)} успешных исходов в этой серии`;
  return `${label} · ${count} Ziehungen · ${number(lang, hits)} Treffer in dieser Serie`;
}

export function resultText(language, phase, probability, result) {
  const lang = rngLanguage(language), label = rngCopy(lang, phase);
  const hits = number(lang, result.hits), draws = number(lang, result.draws);
  const observed = percent(lang, result.observedRatio, 4), configured = percent(lang, Number(probability), 7);
  if (lang === 'en') return `${label}: ${hits} hits out of ${draws} draws · ${observed} % observed · ${configured} % set`;
  if (lang === 'ru') return `${label}: ${hits} успешных исходов из ${draws} испытаний · наблюдалось ${observed} % · задано ${configured} %`;
  return `${label}: ${hits} Treffer aus ${draws} · ${observed} % beobachtet · ${configured} % eingestellt`;
}

export function completionText(language, total) {
  const lang = rngLanguage(language), count = number(lang, total);
  if (lang === 'en') return `Finished: ${count} local draws. The two hit counts are samples.`;
  if (lang === 'ru') return `Готово: ${count} локальных испытаний. Число успешных исходов в каждой серии — выборочный результат.`;
  return `Fertig: ${count} lokale Ziehungen. Die beiden Trefferzahlen sind Stichproben.`;
}

export function failureText(language, error) {
  const lang = rngLanguage(language);
  if (error?.name === 'AbortError') return rngCopy(lang, 'cancelled');
  const detail = rngCopy(lang, ERROR_KEYS[error?.code] || 'unknownError');
  if (lang === 'en') return `Check the input or execution: ${detail}`;
  if (lang === 'ru') return `Проверьте ввод или выполнение: ${detail}`;
  return `Eingabe oder Ausführung prüfen: ${detail}`;
}
