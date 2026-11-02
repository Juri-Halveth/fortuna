import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MAX_DRAWS, parseDraws, parseProbability, runExperiment} from './rng-lab.mjs';

test('probabilities and repetition count reject ambiguous or out-of-range inputs', () => {
  assert.equal(parseProbability('0.000000001'), 1);
  assert.equal(parseProbability('1'), 1_000_000_000);
  assert.equal(parseDraws('999999'), MAX_DRAWS);
  for (const input of ['1.000000001', '0.0000000001', '-0.1', 'NaN', '0,5', '0.5 ']) {
    assert.throws(() => parseProbability(input));
  }
  for (const input of ['0', '1000000', '1.5', '01', 'Infinity']) {
    assert.throws(() => parseDraws(input));
  }
});

test('rejection sampling counts only accepted draws and preserves the two series', async () => {
  const stream = [4_000_000_000, 0, 900_000_000, 4_294_967_295, 100_000_000,
    800_000_000, 4_000_000_000, 400_000_000, 600_000_000];
  let index = 0;
  const value = await runExperiment({base: '0.5', proposed: '0.8', draws: '3'}, {
    randomUint32: () => stream[index++], pause: async () => {},
  });
  assert.equal(index, 9);
  assert.deepEqual([value.baseline.hits, value.baseline.misses], [2, 1]);
  assert.deepEqual([value.changed.hits, value.changed.misses], [2, 1]);
  assert.equal(value.externalEffect, 'NONE');
  assert.equal(value.execution, 'LOCAL_BROWSER_ONLY');
});

test('the published maximum runs both complete series', async () => {
  let calls = 0;
  const value = await runExperiment({base: '0', proposed: '1', draws: '999999'}, {
    randomUint32: () => { calls++; return 123_456_789; }, pause: async () => {},
  });
  assert.equal(calls, 1_999_998);
  assert.equal(value.baseline.hits, 0);
  assert.equal(value.changed.hits, 999_999);
});

test('cancellation returns no completed receipt', async () => {
  const controller = new AbortController();
  await assert.rejects(() => runExperiment({base: '0.1', proposed: '0.2', draws: '999999'}, {
    randomUint32: () => 0,
    signal: controller.signal,
    pause: async () => { controller.abort(); },
  }), {name: 'AbortError'});
});

test('a broken random source cannot keep the browser in an unbounded rejection loop', async () => {
  await assert.rejects(() => runExperiment({base: '0.1', proposed: '0.2', draws: '1'}, {
    randomUint32: () => 4_294_967_295, pause: async () => {},
  }), /zu viele verworfene Werte/);
});
