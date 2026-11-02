// Local, source-owned Bernoulli experiment. No third-party outcome is read or changed.
const SCALE = 1_000_000_000;
const ACCEPT_BELOW = 4_000_000_000; // Four equally sized 1e9 ranges in Uint32.
export const MAX_DRAWS = 999_999;

export function parseProbability(value) {
  if (typeof value !== 'string' || !/^(?:0(?:\.\d{1,9})?|1(?:\.0{1,9})?)$/.test(value)) {
    throw Error('Chance als Dezimalzahl von 0 bis 1 mit höchstens neun Nachkommastellen eingeben.');
  }
  const [whole, fraction = ''] = value.split('.');
  return Number(whole) * SCALE + Number(fraction.padEnd(9, '0'));
}

export function parseDraws(value) {
  if (typeof value !== 'string' || !/^[1-9][0-9]{0,5}$/.test(value) || Number(value) > MAX_DRAWS) {
    throw Error('Ziehungen als Ganzzahl von 1 bis 999999 eingeben.');
  }
  return Number(value);
}

function browserRandom() {
  if (!globalThis.crypto?.getRandomValues) throw Error('Sichere Browser-Zufallsquelle nicht verfügbar.');
  const pool = new Uint32Array(8192);
  let index = pool.length;
  return () => {
    if (index === pool.length) { globalThis.crypto.getRandomValues(pool); index = 0; }
    return pool[index++];
  };
}

const yieldFrame = () => new Promise(resolve => setTimeout(resolve, 0));

export async function runExperiment(request, options = {}) {
  const base = parseProbability(request.base);
  const proposed = parseProbability(request.proposed);
  const draws = parseDraws(request.draws);
  const randomUint32 = options.randomUint32 ?? browserRandom();
  const pause = options.pause ?? yieldFrame;
  const checkCancelled = () => {
    if (options.signal?.aborted) throw new DOMException('Versuch abgebrochen.', 'AbortError');
  };
  const sample = async (threshold, phase, offset) => {
    let hits = 0;
    for (let done = 0; done < draws;) {
      checkCancelled();
      const end = Math.min(done + 4096, draws);
      let rejected = 0;
      while (done < end) {
        const raw = randomUint32();
        if (!Number.isInteger(raw) || raw < 0 || raw > 0xffffffff) throw Error('Ungültiger Zufallswert.');
        if (raw >= ACCEPT_BELOW) {
          if (++rejected > 4096) throw Error('Zufallsquelle liefert zu viele verworfene Werte.');
          continue; // Rejection sampling removes modulo bias.
        }
        if (raw % SCALE < threshold) hits++;
        done++;
      }
      options.onProgress?.({phase, completed: offset + done, total: draws * 2, hits});
      if (done < draws) await pause();
    }
    return {draws, hits, misses: draws - hits, observedRatio: hits / draws};
  };
  checkCancelled();
  const baseline = await sample(base, 'baseline', 0);
  await pause();
  checkCancelled();
  const changed = await sample(proposed, 'proposed', draws);
  return {
    schema: 'fortuna.browser-probability-lab.v1',
    execution: 'LOCAL_BROWSER_ONLY', externalEffect: 'NONE',
    randomSource: 'WEB_CRYPTO_UINT32_REJECTION_SAMPLING',
    request: {base: request.base, proposed: request.proposed, draws},
    baseline, changed,
  };
}
