// One pending frame at most. Paused rooms draw only after a visible change.
export function createFrameLoop({ requestFrame, cancelFrame, render, paused = false, hidden = false }) {
  let pending = null, previous = null, disposed = false;
  function invalidate() {
    if (!disposed && !hidden && pending === null) pending = requestFrame(frame);
  }
  function frame(now) {
    pending = null;
    if (disposed || hidden) return;
    const dt = previous === null ? 0 : Math.max(0, Math.min(.05, (now - previous) / 1000));
    previous = now;
    render(dt);
    if (!paused) invalidate();
  }
  function cancel() {
    if (pending !== null) cancelFrame(pending);
    pending = null;
  }
  invalidate();
  return {
    invalidate,
    setPaused(value) { paused = Boolean(value); previous = null; invalidate(); },
    setHidden(value) {
      hidden = Boolean(value); previous = null;
      if (hidden) cancel(); else invalidate();
    },
    dispose() { disposed = true; cancel(); }
  };
}
