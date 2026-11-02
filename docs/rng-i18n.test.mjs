import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {completionText, failureText, progressText, resultText, rngCopy} from './rng-i18n.mjs';
import {parseDraws, parseProbability, runExperiment} from './rng-lab.mjs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const window = {};
runInNewContext(readFileSync(new URL('./languages/catalog.js', import.meta.url), 'utf8'), {window});
runInNewContext(readFileSync(new URL('./languages/usability.js', import.meta.url), 'utf8'), {window});

test('every new probability-lab label and explanation has English and Russian copy', () => {
  const source = [
    'FORTUNA · LOKALES WAHRSCHEINLICHKEITSLABOR', 'Zufall durchspielen.',
    'Stelle eine Ausgangschance und ein Szenario ein. FORTUNA zieht bis zu 999.999-mal pro Serie mit der sicheren Browser-Zufallsquelle und zeigt die beobachteten Treffer. Das verändert kein fremdes Spiel.',
    'Glücksversuch starten ↗', 'Optionen vergleichen ↗', 'Vergleichsprofile werden geladen.',
    'FORTUNA im HALVETH NETZ Starship Lab öffnen', 'FORTUNA IM NETZ', 'Starship Lab öffnen ↗',
    'WÄHLE WAHRSCHEINLICHKEIT UND WIEDERHOLUNGEN', 'FORTUNA · Glücksversuch',
    'Ein eigener Bernoulli-Versuch im Browser: zwei getrennte Serien, gleiche Anzahl von Ziehungen, ein modelliertes Trefferereignis. Das Modell setzt unabhängige Ziehungen voraus.',
    'Ausgangschance', 'Szenariochance', 'Ziehungen je Serie', '0 bis 1, z. B. 0.01 für 1 %',
    'Eigene Modellannahme, keine Fremdserveränderung', '1 bis 999999 · zusammen höchstens 1.999.998',
    'Zwei Serien ausführen', 'Abbrechen', 'Schließen', 'Fortschritt der Ziehungen',
    'Bereit für den lokalen Versuch.',
    'Web Crypto liefert die Zufallswerte. Treffer sind Modellstichproben, keine Vorhersage oder Steuerung fremder Ergebnisse. Eingaben verlassen diese Seite nicht.',
  ];
  for (const phrase of source) {
    assert.ok(html.includes(phrase), `missing source: ${phrase}`);
    for (const language of ['en', 'ru']) {
      const translated = window.HalvethHubTranslations[phrase]?.[language];
      assert.ok(translated && translated !== phrase, `${language}: ${phrase}`);
    }
  }
});

test('translated results preserve the same counts, probability and two-series limit', async () => {
  const result = await runExperiment({base: '0.125', proposed: '0.75', draws: '4'}, {
    randomUint32: () => 0, pause: async () => {},
  });
  assert.equal(parseProbability('0.125'), 125_000_000);
  assert.equal(parseDraws('999999'), 999_999);
  for (const language of ['en', 'ru']) {
    const summary = resultText(language, 'baseline', '0.125', result.baseline);
    assert.match(summary, /12[.,]5/);
    assert.match(summary, /4/);
    assert.match(progressText(language, 'proposed', 8, 8, 4), /8 \/ 8/);
    assert.match(completionText(language, result.baseline.draws + result.changed.draws), /8/);
    assert.notEqual(rngCopy(language, 'running'), 'Lokale Ziehungen laufen …');
  }
});

test('validation, cancellation and runtime errors are localized without reflecting raw messages', () => {
  const errors = [];
  for (const invoke of [() => parseProbability('0,5'), () => parseDraws('1000000')]) {
    try { invoke(); } catch (error) { errors.push(error); }
  }
  assert.deepEqual(errors.map(error => error.code), ['INVALID_PROBABILITY', 'INVALID_DRAWS']);
  for (const language of ['en', 'ru']) {
    for (const error of [...errors, {code: 'NO_CRYPTO'}, {code: 'INVALID_RANDOM'}, {code: 'EXCESS_REJECTS'}]) {
      assert.ok(failureText(language, error));
      assert.doesNotMatch(failureText(language, error), /Eingabe oder Ausführung prüfen|Chance als Dezimalzahl|Ziehungen als Ganzzahl|Zufallsquelle/);
    }
    assert.notEqual(failureText(language, {name: 'AbortError'}), 'Versuch abgebrochen; keine Ergebnisbehauptung.');
    assert.doesNotMatch(failureText(language, new Error('<img src=x onerror=alert(1)>')), /<img|onerror/);
  }
});
