import './style.css';
import { contrast, hexToRgb, mix, nearest, rgbToHex, separation, simulate, type RGB, type Vision } from './color';

type Swatch = { id: number; name: string; hex: string };
type Frame = { name: string; url: string; image: HTMLImageElement; coverage: number[] };
type Finding = { a: number; b: number; v: Vision; sep: number; lum: number; score: number };

const starter: Swatch[] = [
  { id: 1, name: 'Night ink', hex: '#26374A' },
  { id: 2, name: 'Signal coral', hex: '#C95B4C' },
  { id: 3, name: 'Moss plot', hex: '#667A54' },
  { id: 4, name: 'Sun tape', hex: '#D9A832' },
  { id: 5, name: 'Paper glow', hex: '#F3E4C7' }
];
const sample: Swatch[] = [
  { id: 1, name: 'Night platform', hex: '#25364B' },
  { id: 2, name: 'Signal coral', hex: '#C95B4C' },
  { id: 3, name: 'Moss lamp', hex: '#8A704F' },
  { id: 4, name: 'Platform light', hex: '#E2B84E' },
  { id: 5, name: 'Paper mist', hex: '#F3E4C7' }
];
const sampleFrames = [
  { name: 'night-transit-loop-01.svg', url: '/sample-night-transit-01.svg' },
  { name: 'night-transit-loop-02.svg', url: '/sample-night-transit-02.svg' }
];
const demoStorageKey = 'demo:generative-palette-a11y:study';
const isDemo = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';

let swatches = structuredClone(starter);
let frames: Frame[] = [];
let nextId = 6;

const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const swatchBox = el('swatches');
const report = el('report');
const frameList = el('frameList');
const frameEmpty = el('frameEmpty');
const frameError = el('frameError');
const demoBanner = el('demoBanner');
const studyLabel = el('studyLabel');

function make<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text: string, className?: string) {
  const node = make('button', className, text);
  node.type = 'button';
  return node;
}

function safePalette(): RGB[] {
  return swatches.map(swatch => hexToRgb(swatch.hex) ?? [0, 0, 0]);
}

function saveDemo() {
  if (!isDemo) return;
  localStorage.setItem(demoStorageKey, JSON.stringify({ swatches }));
}

function clearFrames() {
  frames.forEach(frame => {
    if (frame.url.startsWith('blob:')) URL.revokeObjectURL(frame.url);
  });
  frames = [];
}

function restoreStudy() {
  swatches = structuredClone(starter);
  nextId = 6;
  clearFrames();
  renderSwatches();
  renderFrames();
  renderReport();
}

function renderSwatches() {
  const rows = document.createDocumentFragment();
  swatches.forEach(swatch => {
    const row = make('div', 'swatch-row');
    const paint = make('label', 'paint');
    paint.style.setProperty('--paint', swatch.hex);
    paint.setAttribute('aria-label', `Choose ${swatch.name} colour`);
    const colourInput = document.createElement('input');
    colourInput.type = 'color';
    colourInput.value = swatch.hex;
    colourInput.dataset.id = String(swatch.id);
    colourInput.dataset.field = 'color';
    paint.append(colourInput);

    const nameLabel = make('label', 'sr-only', 'Swatch name');
    nameLabel.htmlFor = `name-${swatch.id}`;
    const nameInput = document.createElement('input');
    nameInput.id = `name-${swatch.id}`;
    nameInput.className = 'name-input';
    nameInput.value = swatch.name;
    nameInput.dataset.id = String(swatch.id);
    nameInput.dataset.field = 'name';

    const hexLabel = make('label', 'sr-only', 'Hex colour');
    hexLabel.htmlFor = `hex-${swatch.id}`;
    const hexInput = document.createElement('input');
    hexInput.id = `hex-${swatch.id}`;
    hexInput.className = 'hex-input';
    hexInput.value = swatch.hex;
    hexInput.maxLength = 7;
    hexInput.dataset.id = String(swatch.id);
    hexInput.dataset.field = 'hex';

    const remove = button('Remove', 'remove');
    remove.dataset.remove = String(swatch.id);
    remove.setAttribute('aria-label', `Remove ${swatch.name}`);
    remove.disabled = swatches.length <= 2;

    [colourInput, nameInput, hexInput].forEach(input => input.addEventListener('input', () => {
      const item = swatches.find(current => current.id === Number(input.dataset.id));
      if (!item) return;
      const field = input.dataset.field;
      if (field === 'color') {
        item.hex = input.value.toUpperCase();
      } else if (field === 'hex') {
        if (!hexToRgb(input.value)) {
          input.setAttribute('aria-invalid', 'true');
          return;
        }
        item.hex = input.value.toUpperCase();
      } else {
        item.name = input.value;
      }
      input.removeAttribute('aria-invalid');
      saveDemo();
      if (field !== 'name') {
        renderSwatches();
        recalcFrameCoverage();
      }
      renderReport();
    }));
    remove.addEventListener('click', () => {
      swatches = swatches.filter(current => current.id !== swatch.id);
      saveDemo();
      renderSwatches();
      recalcFrameCoverage();
      renderReport();
    });
    row.append(paint, nameLabel, nameInput, hexLabel, hexInput, remove);
    rows.append(row);
  });
  swatchBox.replaceChildren(rows);
}

function activeVisions() {
  return [...document.querySelectorAll<HTMLInputElement>('input[name="simulation"]:checked')].map(input => input.value as Vision);
}

function visibleWeight(index: number) {
  return frames.length
    ? frames.reduce((sum, frame) => sum + (frame.coverage[index] ?? 0), 0) / frames.length
    : 1 / swatches.length;
}

function scorePair(a: number, b: number, vision: Vision) {
  const palette = safePalette();
  const sep = separation(simulate(palette[a], vision), simulate(palette[b], vision));
  const lum = contrast(simulate(palette[a], vision), simulate(palette[b], vision));
  const presence = Math.sqrt(visibleWeight(a) * visibleWeight(b));
  return { sep, lum, presence, score: (Math.max(0, 52 - sep) / 52) * (0.45 + presence) };
}

function labelVision(vision: Vision) {
  return ({ normal: 'Original', protanopia: 'Protanopia', deuteranopia: 'Deuteranopia', tritanopia: 'Tritanopia' })[vision];
}

function suggestedHex(index: number, other: number, vision: Vision) {
  const original = safePalette()[index];
  const target = safePalette()[other];
  let best = original;
  let bestSep = separation(simulate(original, vision), simulate(target, vision));
  for (const amount of [-0.42, -0.34, -0.26, -0.18, 0.18, 0.26, 0.34, 0.42]) {
    const candidate = mix(original, amount);
    const candidateSeparation = separation(simulate(candidate, vision), simulate(target, vision));
    if (candidateSeparation > bestSep) {
      best = candidate;
      bestSep = candidateSeparation;
    }
  }
  return rgbToHex(best);
}

function createFinding(finding: Finding, rank: number) {
  const palette = safePalette();
  const first = swatches[finding.a];
  const second = swatches[finding.b];
  const candidate = suggestedHex(finding.a, finding.b, finding.v);
  const simulatedFirst = rgbToHex(simulate(palette[finding.a], finding.v));
  const simulatedSecond = rgbToHex(simulate(palette[finding.b], finding.v));
  const candidateText = contrast(hexToRgb(candidate)!, [255, 255, 255]) >= contrast(hexToRgb(candidate)!, [24, 22, 19]) ? '#fff' : '#181613';
  const item = make('li', 'finding');
  item.append(make('div', 'finding-number', String(rank + 1).padStart(2, '0')));
  const pair = make('div', 'pair');
  const firstDot = make('span', 'dot');
  firstDot.style.background = simulatedFirst;
  const arrow = make('span', undefined, '↔');
  arrow.setAttribute('aria-hidden', 'true');
  const secondDot = make('span', 'dot');
  secondDot.style.background = simulatedSecond;
  const details = make('p');
  details.append(`${labelVision(finding.v)}: `);
  details.append(make('b', undefined, `${Math.round(finding.sep)} / 255`));
  details.append(` separation · ${finding.lum.toFixed(1)}:1 luminance contrast`);
  if (frames.length) details.append(` · ${Math.round((visibleWeight(finding.a) + visibleWeight(finding.b)) * 50)}% visible area`);
  pair.append(firstDot, make('strong', undefined, first.name), arrow, secondDot, make('strong', undefined, second.name), details);
  const fix = make('div', 'fix');
  fix.append(make('span', undefined, 'Bounded lightness alternative'));
  const apply = button(`Use ${candidate}`);
  apply.style.setProperty('--suggest', candidate);
  apply.style.setProperty('--suggest-text', candidateText);
  apply.addEventListener('click', () => {
    const swatch = swatches.find(current => current.id === first.id);
    if (!swatch) return;
    swatch.hex = candidate;
    saveDemo();
    renderSwatches();
    recalcFrameCoverage();
    renderReport();
  });
  fix.append(apply);
  item.append(pair, fix);
  return item;
}

function renderReport() {
  const visions = activeVisions();
  if (visions.length === 0) {
    const empty = make('div', 'empty-report');
    empty.append(make('strong', undefined, 'Choose a viewing condition.'), make('p', undefined, 'Keep Original selected to compare the palette you started with.'));
    report.replaceChildren(empty);
    return;
  }
  const findings: Finding[] = [];
  for (let first = 0; first < swatches.length; first += 1) {
    for (let second = first + 1; second < swatches.length; second += 1) {
      visions.forEach(vision => findings.push({ a: first, b: second, v: vision, ...scorePair(first, second, vision) }));
    }
  }
  findings.sort((first, second) => second.score - first.score);
  const critical = findings.filter(finding => finding.sep < 52).slice(0, 5);
  const summary = make('div', 'analysis-summary');
  const count = make('div');
  count.append(make('span', 'metric', String(critical.length)), make('span', undefined, `pair${critical.length === 1 ? '' : 's'} to inspect`));
  const summaryText = frames.length
    ? `Weighted across ${frames.length} frame${frames.length === 1 ? '' : 's'}.`
    : 'Swatch-only study — add frames to weight visible area.';
  const preview = make('div', 'preview-strip');
  preview.setAttribute('aria-hidden', 'true');
  safePalette().forEach(colour => {
    const strip = make('span');
    strip.style.background = rgbToHex(simulate(colour, visions[0]));
    preview.append(strip);
  });
  summary.append(count, make('p', undefined, summaryText), preview);
  const parts: Node[] = [summary];
  if (critical.length) {
    const list = make('ol', 'findings');
    critical.forEach((finding, index) => list.append(createFinding(finding, index)));
    parts.push(list);
  } else {
    const empty = make('div', 'empty-report');
    empty.append(make('strong', undefined, 'Your selected conditions show clear pair separation.'), make('p', undefined, 'Add representative frames to check which pair occupies the most visible area.'));
    parts.push(empty);
  }
  parts.push(make('p', 'fineprint', 'Separation below 52 / 255 is flagged. This is an approximate screen-colour heuristic, not conformance certification.'));
  report.replaceChildren(...parts);
}

async function imageFromUrl(name: string, url: string): Promise<Frame> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Could not read ${name}`));
    image.src = url;
  });
  return { name, url, image, coverage: [] };
}

async function loadFrames(files: FileList) {
  const selected = [...files].slice(0, Math.max(0, 6 - frames.length));
  if (!selected.length) {
    frameError.textContent = frames.length >= 6 ? 'You can compare up to six frames. Remove one before adding another.' : '';
    return;
  }
  frameError.textContent = files.length > selected.length ? 'Only the first six frames are used.' : '';
  for (const file of selected) {
    if (file.size > 8_000_000) {
      frameError.textContent = `${file.name} is over 8 MB; choose a smaller frame.`;
      continue;
    }
    const url = URL.createObjectURL(file);
    try {
      frames.push(await imageFromUrl(file.name, url));
    } catch {
      URL.revokeObjectURL(url);
      frameError.textContent = `Could not read ${file.name}. Try PNG, JPEG, WebP, or GIF.`;
    }
  }
  saveDemo();
  renderFrames();
  recalcFrameCoverage();
  renderReport();
}

function renderFrames() {
  frameEmpty.hidden = frames.length > 0;
  const rendered = document.createDocumentFragment();
  frames.forEach((frame, index) => {
    const figure = make('figure', 'frame');
    const image = document.createElement('img');
    image.src = frame.url;
    image.alt = `Selected frame: ${frame.name}`;
    const caption = document.createElement('figcaption');
    caption.append(document.createTextNode(frame.name));
    const remove = button('Remove');
    remove.setAttribute('aria-label', `Remove ${frame.name}`);
    remove.addEventListener('click', () => {
      const [removed] = frames.splice(index, 1);
      if (removed.url.startsWith('blob:')) URL.revokeObjectURL(removed.url);
      saveDemo();
      renderFrames();
      recalcFrameCoverage();
      renderReport();
    });
    caption.append(remove);
    figure.append(image, caption);
    rendered.append(figure);
  });
  frameList.replaceChildren(rendered);
}

function recalcFrameCoverage() {
  const palette = safePalette();
  frames.forEach(frame => {
    const canvas = document.createElement('canvas');
    const longest = 120;
    const scale = Math.min(1, longest / Math.max(frame.image.naturalWidth, frame.image.naturalHeight));
    canvas.width = Math.max(1, Math.round(frame.image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(frame.image.naturalHeight * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    context.drawImage(frame.image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const counts = palette.map(() => 0);
    const total = Math.max(1, pixels.length / 4);
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] < 80) continue;
      counts[nearest([pixels[index], pixels[index + 1], pixels[index + 2]], palette).index] += 1;
    }
    frame.coverage = counts.map(count => count / total);
  });
}

function exportReport() {
  const data = {
    generatedAt: new Date().toISOString(),
    assumptions: 'Local sRGB matrix approximations; flagged simulated separation below 52 / 255.',
    swatches,
    frames: frames.map(frame => ({ name: frame.name, estimatedCoverage: frame.coverage })),
    selectedSimulations: activeVisions()
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const download = document.createElement('a');
  download.href = url;
  download.download = 'palette-a11y-field-notes.json';
  download.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function enterDemo() {
  const saved = localStorage.getItem(demoStorageKey);
  let storedSwatches: Swatch[] | undefined;
  try {
    const parsed = saved ? JSON.parse(saved) : undefined;
    if (Array.isArray(parsed?.swatches) && parsed.swatches.every((entry: Swatch) => typeof entry.name === 'string' && typeof entry.hex === 'string' && hexToRgb(entry.hex))) storedSwatches = parsed.swatches;
  } catch {
    localStorage.removeItem(demoStorageKey);
  }
  swatches = structuredClone(storedSwatches ?? sample);
  nextId = Math.max(...swatches.map(swatch => swatch.id)) + 1;
  clearFrames();
  frameError.textContent = '';
  const loaded = await Promise.all(sampleFrames.map(frame => imageFromUrl(frame.name, frame.url).catch(() => undefined)));
  frames = loaded.filter((frame): frame is Frame => Boolean(frame));
  saveDemo();
  demoBanner.removeAttribute('aria-hidden');
  demoBanner.removeAttribute('inert');
  studyLabel.hidden = false;
  renderSwatches();
  renderFrames();
  recalcFrameCoverage();
  renderReport();
}

async function resetDemo() {
  localStorage.removeItem(demoStorageKey);
  await enterDemo();
}

function updateOffline() {
  el('offline').hidden = navigator.onLine;
}

el('addSwatch').addEventListener('click', () => {
  swatches.push({ id: nextId++, name: `New mark ${swatches.length + 1}`, hex: '#7C5C8E' });
  saveDemo();
  renderSwatches();
  renderReport();
});
el('resetPalette').addEventListener('click', () => {
  if (isDemo) void resetDemo();
  else restoreStudy();
});
el('resetDemo').addEventListener('click', () => void resetDemo());
el('startForReal').addEventListener('click', () => {
  localStorage.removeItem(demoStorageKey);
  location.assign('/');
});
const frameInput = el<HTMLInputElement>('frames');
frameInput.addEventListener('change', () => {
  if (frameInput.files) void loadFrames(frameInput.files);
  frameInput.value = '';
});
document.querySelectorAll<HTMLInputElement>('input[name="simulation"]').forEach(input => input.addEventListener('change', renderReport));
el('exportReport').addEventListener('click', exportReport);
addEventListener('online', updateOffline);
addEventListener('offline', updateOffline);

document.title = isDemo ? 'Demo — Generative Palette A11y' : 'Generative Palette A11y — check sketch palettes';
updateOffline();
if (isDemo) void enterDemo();
else {
  renderSwatches();
  renderFrames();
  renderReport();
}
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
