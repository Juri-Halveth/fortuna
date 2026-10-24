import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFrameLoop } from './frame-loop.mjs';

function fixture(options = {}) {
  const queue = new Map(), frames = []; let next = 0;
  const loop = createFrameLoop({ ...options,
    requestFrame(callback) { queue.set(++next, callback); return next; },
    cancelFrame(id) { queue.delete(id); }, render(dt) { frames.push(dt); }
  });
  function tick(now) {
    const entry = queue.entries().next().value;
    assert.ok(entry, 'an actual pending frame is required');
    queue.delete(entry[0]); entry[1](now);
  }
  return { loop, queue, frames, tick };
}
test('pause and repeated invalidation draw once, then leave no queued frame work', () => {
  const f = fixture({ paused: true });
  f.tick(1000); assert.equal(f.queue.size, 0);
  for (let i = 0; i < 20; i++) f.loop.invalidate();
  assert.equal(f.queue.size, 1);
  f.tick(4000); assert.equal(f.queue.size, 0); assert.equal(f.frames.length, 2);
});
test('running time is bounded and resume does not accumulate paused or hidden time', () => {
  const f = fixture(); f.tick(1000); f.tick(1016);
  assert.equal(f.queue.size, 1); assert.equal(f.frames[1], .016);
  f.loop.setPaused(true); f.tick(9000); assert.equal(f.queue.size, 0);
  f.loop.setPaused(false); f.tick(20000); assert.equal(f.frames.at(-1), 0);
  f.tick(30000); assert.equal(f.frames.at(-1), .05);
  f.loop.setHidden(true); assert.equal(f.queue.size, 0);
  f.loop.invalidate(); assert.equal(f.queue.size, 0);
  f.loop.setHidden(false); f.tick(50000); assert.equal(f.frames.at(-1), 0);
  f.loop.dispose(); assert.equal(f.queue.size, 0);
  f.loop.invalidate(); f.loop.setHidden(false); assert.equal(f.queue.size, 0);
});
test('a hidden paused initial scene waits until visible and stays paused after redraw', () => {
  const f = fixture({ paused: true, hidden: true });
  assert.equal(f.queue.size, 0); f.loop.setHidden(false); f.tick(1000);
  assert.equal(f.queue.size, 0);
});
