import * as runtime from './vendor/runtime.mjs';
import { createEntityFigure } from './vendor/entity-figures.mjs';
import { createFortunaStone } from './stone.mjs';
import { createCuriosity } from './curiosity.mjs';
const { THREE: T, OrbitControls } = runtime;
runtime.createIcons({ icons: Object.fromEntries(Object.entries(runtime).filter(([k]) => !['THREE','OrbitControls','createIcons'].includes(k))) });
const entities = window.HalvethUniverse.entities;
document.querySelector('#count').textContent = `${entities.length} Figuren`;
const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping;
document.querySelector('#world').append(renderer.domElement);
const scene = new T.Scene(); scene.background = new T.Color('#192125');
const camera = new T.PerspectiveCamera(48, 1, .1, 200);
const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(0, 1, 0);
camera.position.set(27, 32, 40); controls.update();
scene.add(new T.HemisphereLight('#edfdf7', '#72626d', 2.7));
const key = new T.DirectionalLight('#fff0d9', 3); key.position.set(18, 30, 8); scene.add(key);
const ground = new T.Mesh(new T.PlaneGeometry(180,180), new T.MeshStandardMaterial({ color:'#394646', roughness: .9 }));
ground.rotation.x = -Math.PI/2; ground.position.y = -.02; scene.add(ground);
const grid = new T.GridHelper(180, 60, '#72817e', '#455653'); scene.add(grid);
const stone = createFortunaStone(T); scene.add(stone.group);
const positions = new Map();
const entries = entities.map((entity, i) => {
  const angle = i * 2.3999632297, radius = 12 + Math.sqrt((i + 1)/entities.length) * 10;
  positions.set(entity.id, [Math.cos(angle)*radius, 0, Math.sin(angle)*radius]);
  const figure = createEntityFigure(T, entity, i); scene.add(figure.group);
  return { entity, figure, last: [...positions.get(entity.id)] };
});
const curiosity = createCuriosity(entities.map(e=>e.id));
let time = 0, previous = performance.now(), paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pause = document.querySelector('#pause');
function label() { pause.querySelector('span').textContent = paused ? 'Weiter' : 'Pause'; pause.setAttribute('aria-pressed', String(paused)); }
label(); pause.onclick = () => { paused = !paused; label(); };
document.querySelector('#ask').onclick = () => {
  curiosity.impulse(time);
  document.querySelector('#details').hidden = true;
  document.querySelector('#question').hidden = false;
};
document.querySelector('#inspect').onclick = () => {
  const details = document.querySelector('#details'); details.hidden = !details.hidden;
  document.querySelector('#question').hidden = true;
  document.querySelector('#title').textContent = 'FORTUNA';
};
fetch('object.json').then(r=>r.ok?r.json():Promise.reject()).then(m=>{
  document.querySelector('#digest').textContent = `SHA-256: ${m.sourceArchive.sha256}`;
  const link = document.querySelector('#source-link');
  if (m.sourceArchive.path === 'source/FORTUNA_SOURCE_09604b0.zip') { link.href = m.sourceArchive.path; link.hidden = false; }
  document.querySelector('#archive-status').textContent = m.sourceArchive.path ? 'Quellarchiv lokal vorhanden.' : 'Desktop-Quellarchiv noch nicht veroeffentlicht.';
}).catch(()=>{ document.querySelector('#digest').textContent='Archivnachweis nicht geladen.'; });
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.set(w<600?52:27,w<600?65:32,w<600?98:40);camera.updateProjectionMatrix();controls.update();}
addEventListener('resize',resize);resize();
document.addEventListener('visibilitychange',()=>{previous=performance.now();});
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.max(0,Math.min(.05,(now-previous)/1000));previous=now;
  if(document.hidden)return;
  if(!paused)time+=dt;
  const samples=curiosity.step(time,positions);
  for(const e of entries){const p=samples.get(e.entity.id);e.figure.group.position.fromArray(p.position);
    const dx=p.position[0]-e.last[0],dz=p.position[2]-e.last[2];
    e.figure.group.rotation.y=Math.hypot(dx,dz)>.00001?Math.atan2(dx,dz):Math.atan2(-p.position[0],-p.position[2]);
    e.figure.animate(time,false,paused,{walking:p.walking&&!paused,speed:2,phase:time*6});e.last=p.position;
  }
  stone.update(time,paused);renderer.render(scene,camera);
  const values=[...samples.values()];
  const discovered=values.filter(p=>p.discovered).length;
  const exploring=values.filter(p=>p.phase==='EXPLORING').length;
  const active=values.filter(p=>p.position.every(Number.isFinite)).length;
  document.querySelector('#events').textContent=`${active} aktiv · ${discovered} untersucht · ${exploring} unterwegs`;
  document.body.dataset.exploring=String(exploring);
  document.body.dataset.positions=JSON.stringify(values.map(p=>p.position));
  const decision=curiosity.decisions.find(d=>d.entityId==='scarlet') ?? curiosity.decisions[0];
  document.querySelector('#decision').textContent=decision ? `${entities.find(e=>e.id===decision.entityId)?.label ?? decision.entityId}: ${decision.reason} Auswahl: ${decision.action==='EXPLORE'?'Umgebung erkunden':'Untersuchung fortsetzen'}.` : 'Noch keine abgeschlossene Untersuchung.';
  document.body.dataset.time=time.toFixed(2);document.body.dataset.discovered=String(discovered);
}
requestAnimationFrame(frame);
