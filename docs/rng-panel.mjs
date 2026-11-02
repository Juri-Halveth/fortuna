import {runExperiment} from './rng-lab.mjs';

const dialog = document.querySelector('#rng-dialog');
const form = document.querySelector('#rng-form');
const status = document.querySelector('#rng-status');
const output = document.querySelector('#rng-output');
const progress = document.querySelector('#rng-progress');
const start = document.querySelector('#rng-start');
const cancel = document.querySelector('#rng-cancel');
let controller = null;

document.querySelector('#rng-open').addEventListener('click', () => {
  dialog.showModal();
  document.querySelector('#rng-base').focus();
});
document.querySelector('#rng-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => controller?.abort());
cancel.addEventListener('click', () => controller?.abort());

function resultRow(label, probability, result, maxRatio) {
  const row = document.createElement('div');
  row.className = 'rng-result-row';
  const caption = document.createElement('div');
  caption.textContent = `${label}: ${result.hits.toLocaleString('de-DE')} Treffer aus ${result.draws.toLocaleString('de-DE')} · ${(100 * result.observedRatio).toLocaleString('de-DE', {maximumFractionDigits: 4})} % beobachtet · ${(100 * Number(probability)).toLocaleString('de-DE', {maximumFractionDigits: 7})} % eingestellt`;
  const track = document.createElement('div');
  track.className = 'rng-track';
  const fill = document.createElement('div');
  fill.className = 'rng-fill';
  fill.style.width = `${Math.min(100, 100 * result.observedRatio / maxRatio)}%`;
  track.append(fill);
  row.append(caption, track);
  return row;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (controller) return;
  const request = {
    base: document.querySelector('#rng-base').value.trim(),
    proposed: document.querySelector('#rng-proposed').value.trim(),
    draws: document.querySelector('#rng-draws').value.trim(),
  };
  const current = new AbortController();
  controller = current;
  start.disabled = true;
  cancel.disabled = false;
  progress.value = 0;
  output.replaceChildren();
  status.textContent = 'Lokale Ziehungen laufen …';
  let lastAnnouncement = 0;
  let lastPhase = '';
  try {
    const result = await runExperiment(request, {
      signal: current.signal,
      onProgress: ({phase, completed, total, hits}) => {
        progress.value = completed / total;
        if (phase !== lastPhase || completed - lastAnnouncement >= total / 20 || completed === total) {
          status.textContent = `${phase === 'baseline' ? 'Ausgangschance' : 'Szenario'} · ${completed.toLocaleString('de-DE')} / ${total.toLocaleString('de-DE')} Ziehungen · ${hits.toLocaleString('de-DE')} Treffer in dieser Serie`;
          lastAnnouncement = completed;
          lastPhase = phase;
        }
      },
    });
    const maxRatio = Math.max(result.baseline.observedRatio, result.changed.observedRatio, 0.000001);
    output.append(
      resultRow('Ausgangschance', request.base, result.baseline, maxRatio),
      resultRow('Szenario', request.proposed, result.changed, maxRatio),
    );
    status.textContent = `Fertig: ${(result.baseline.draws + result.changed.draws).toLocaleString('de-DE')} lokale Ziehungen. Die beiden Trefferzahlen sind Stichproben.`;
  } catch (error) {
    status.textContent = error.name === 'AbortError' ? 'Versuch abgebrochen; keine Ergebnisbehauptung.' : `Eingabe oder Ausführung prüfen: ${error.message}`;
  } finally {
    if (controller === current) controller = null;
    start.disabled = false;
    cancel.disabled = true;
  }
});
