// A local simulation: proximity and novelty, not a claim about inner experience.
export function evaluateActivity({ discovered, waitingSeconds, nearbyCount }) {
  if (typeof discovered !== 'boolean' || !Number.isFinite(waitingSeconds) || waitingSeconds < 0 || !Number.isInteger(nearbyCount) || nearbyCount < 0) throw new TypeError('Measured activity inputs required');
  if (!discovered) return { action: 'CONTINUE', reason: 'Die Untersuchung ist noch offen.' };
  if (nearbyCount >= 3) return { action: 'EXPLORE', reason: 'Untersuchung fertig; hier stehen mehrere Figuren dicht zusammen.' };
  if (waitingSeconds >= 4) return { action: 'EXPLORE', reason: 'Untersuchung fertig; weiteres Warten bringt keine neue Beobachtung.' };
  return { action: 'CONTINUE', reason: 'Untersuchung fertig; kurze Orientierung vor der naechsten Taetigkeit.' };
}
export function createCuriosity(ids, { radius = 40, speed = 2, dwell = 4 } = {}) {
  if (!Array.isArray(ids) || new Set(ids).size !== ids.length || ids.some(id => typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id))) throw new TypeError('Unique IDs required');
  if (![radius, speed, dwell].every(n => Number.isFinite(n) && n > 0)) throw new TypeError('Positive parameters required');
  const states = new Map(ids.map((id, index) => [id, {
    phase: 'ROAMING', noticedAt: null, inspectedAt: null, discoveredAt: null, departedAt: null, exploreAt: null, start: null, decision: null,
    delay: [...id].reduce((n, c) => n + c.charCodeAt(0), 0) % 40 / 10,
    angle: index * 2.3999632297, radius: 3.5 + index % 4 * 1.6
  }]));
  let previous = -Infinity, impulseAt = null, observedPositions = new Map();
  const decisions = new Map();
  const events = [];
  function step(time, positions, target = [0, 0, 0]) {
    const point = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite);
    if (!Number.isFinite(time) || time < previous || !point(target) || !(positions instanceof Map) || [...states.keys()].some(id => !point(positions.get(id)))) throw new TypeError('Monotonic time and complete finite positions required');
    previous = time;
    const result = new Map([...states].map(([id, state]) => {
      const original = positions.get(id);
      const distance = Math.hypot(original[0] - target[0], original[2] - target[2]);
      if (state.phase === 'ROAMING' && distance <= radius) {
        state.phase = 'NOTICED'; state.noticedAt = time; state.start = [...original];
        events.push({ entityId: id, kind: 'NOTICED', at: time });
      }
      if (state.phase === 'ROAMING') return [id, { position: [...original], phase: state.phase, discovered: false, walking: false }];
      const goal = [target[0] + Math.cos(state.angle) * state.radius, target[1], target[2] + Math.sin(state.angle) * state.radius];
      const length = Math.hypot(...goal.map((n, i) => n - state.start[i]));
      const elapsed = Math.max(0, time - state.noticedAt - state.delay);
      const progress = length ? Math.min(1, elapsed * speed / length) : 1;
      let position = state.start.map((n, i) => n + (goal[i] - n) * progress);
      if (progress === 1 && state.inspectedAt === null) {
        state.inspectedAt = state.noticedAt + state.delay + length / speed; state.phase = 'INSPECTING';
        events.push({ entityId: id, kind: 'INSPECTING', at: state.inspectedAt });
      } else if (elapsed > 0 && state.inspectedAt === null) state.phase = 'APPROACHING';
      if (state.inspectedAt !== null && time - state.inspectedAt >= dwell && state.discoveredAt === null) {
        state.discoveredAt = state.inspectedAt + dwell;
        state.phase = 'DISCOVERED'; events.push({ entityId: id, kind: 'DISCOVERED', at: state.discoveredAt });
      }
      if (state.discoveredAt !== null) {
        if (state.departedAt === null) {
          const own = observedPositions.get(id) ?? position;
          const nearbyCount = [...observedPositions].filter(([other, p]) => other !== id && Math.hypot(p[0]-own[0],p[2]-own[2]) < 3).length;
          const observation = { discovered: true, waitingSeconds: time-state.discoveredAt, nearbyCount };
          const choice = evaluateActivity(observation);
          state.decision = { entityId:id, at:time, question:'Ist meine aktuelle Taetigkeit noch sinnvoll?', trigger:impulseAt === null ? 'LOCAL_REVIEW' : 'ROOM_QUESTION', observation, ...choice };
          decisions.set(id, state.decision);
          if (choice.action === 'EXPLORE') state.departedAt = time + state.delay * .2;
        }
        const departure = state.departedAt ?? Infinity;
        if (time >= departure) {
          if (state.phase === 'DISCOVERED') events.push({ entityId: id, kind: 'RETURNING', at: departure });
          state.phase = 'RETURNING';
          const back = length ? Math.min(1, (time - departure) * speed / length) : 1;
          position = goal.map((n, i) => n + (state.start[i] - n) * back);
          if (back === 1) {
            const start = departure + length / speed;
            if (state.exploreAt === null) { state.exploreAt = start; events.push({ entityId: id, kind: 'EXPLORING', at: start }); }
            state.phase = 'EXPLORING';
            const t = time - start, ramp = Math.min(1, t / 4);
            position = [state.start[0] + ramp * 4 * Math.sin(t * .22 + state.angle), state.start[1], state.start[2] + ramp * 3 * Math.sin(t * .29 + state.angle * 2)];
          }
        }
      }
      return [id, { position, phase: state.phase, discovered: state.discoveredAt !== null, walking: ['APPROACHING','RETURNING','EXPLORING'].includes(state.phase) }];
    }));
    observedPositions = new Map([...result].map(([id,p])=>[id,[...p.position]]));
    return result;
  }
  return { step, impulse(time) { if (!Number.isFinite(time) || time < previous) throw new TypeError('Current room time required'); impulseAt = time; }, get decisions() { return [...decisions.values()].map(d=>({...d,observation:{...d.observation}})); }, get events() { return events.map(e => ({ ...e })); } };
}
