import {runExperiment} from './rng-lab.mjs?v=sha256-f97265dcc61da1f8dbe8ae8379b46e9f9e193f712457e7723a14fc1b33b0e852';
import {completionText, failureText, progressText, resultText, rngCopy, rngLanguage} from './rng-i18n.mjs?v=sha256-51e6c7f76fb50d7b2d0b11deaa7fad6a2c578d886734c8e816556fd30316d58f';

const language = rngLanguage(window.HalvethHubLanguage?.language);
document.title = rngCopy(language, 'title');

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

function resultRow(phase, probability, result, maxRatio) {
  const row = document.createElement('div');
  row.className = 'rng-result-row';
  const caption = document.createElement('div');
  caption.textContent = resultText(language, phase, probability, result);
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
  status.textContent = rngCopy(language, 'running');
  let lastAnnouncement = 0;
  let lastPhase = '';
  try {
    const result = await runExperiment(request, {
      signal: current.signal,
      onProgress: ({phase, completed, total, hits}) => {
        progress.value = completed / total;
        if (phase !== lastPhase || completed - lastAnnouncement >= total / 20 || completed === total) {
          status.textContent = progressText(language, phase, completed, total, hits);
          lastAnnouncement = completed;
          lastPhase = phase;
        }
      },
    });
    const maxRatio = Math.max(result.baseline.observedRatio, result.changed.observedRatio, 0.000001);
    output.append(
      resultRow('baseline', request.base, result.baseline, maxRatio),
      resultRow('proposed', request.proposed, result.changed, maxRatio),
    );
    status.textContent = completionText(language, result.baseline.draws + result.changed.draws);
  } catch (error) {
    status.textContent = failureText(language, error);
  } finally {
    if (controller === current) controller = null;
    start.disabled = false;
    cancel.disabled = true;
  }
});
