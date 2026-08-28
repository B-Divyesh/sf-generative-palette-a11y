import './style.css';
import { contrast, hexToRgb, mix, nearest, rgbToHex, separation, simulate, type RGB, type Vision } from './color';

type Swatch = { id: number; name: string; hex: string };
type Frame = { name: string; url: string; image: HTMLImageElement; coverage: number[] };
const starter: Swatch[] = [
  { id: 1, name: 'Night ink', hex: '#26374A' }, { id: 2, name: 'Signal coral', hex: '#C95B4C' },
  { id: 3, name: 'Moss plot', hex: '#667A54' }, { id: 4, name: 'Sun tape', hex: '#D9A832' }, { id: 5, name: 'Paper glow', hex: '#F3E4C7' }
];
let swatches = structuredClone(starter), frames: Frame[] = [], nextId = 6;
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const swatchBox = el('swatches'), report = el('report'), frameList = el('frameList'), frameEmpty = el('frameEmpty'), frameError = el('frameError');

function safePalette(): RGB[] { return swatches.map(s => hexToRgb(s.hex) ?? [0, 0, 0]); }
function renderSwatches() {
  swatchBox.innerHTML = swatches.map((s, i) => `<div class="swatch-row"><label class="paint" style="--paint:${s.hex}" aria-label="Choose ${s.name} colour"><input data-id="${s.id}" data-field="color" type="color" value="${s.hex}" /></label><label class="sr-only" for="name-${s.id}">Swatch name</label><input id="name-${s.id}" data-id="${s.id}" data-field="name" class="name-input" value="${escapeHtml(s.name)}" /><label class="sr-only" for="hex-${s.id}">Hex colour</label><input id="hex-${s.id}" data-id="${s.id}" data-field="hex" class="hex-input" value="${s.hex}" maxlength="7" /><button data-remove="${s.id}" class="remove" type="button" aria-label="Remove ${escapeHtml(s.name)}" ${swatches.length <= 2 ? 'disabled' : ''}>×</button></div>`).join('');
  swatchBox.querySelectorAll<HTMLInputElement>('input').forEach(input => input.addEventListener('input', () => {
    const item = swatches.find(s => s.id === Number(input.dataset.id)); if (!item) return;
    const field = input.dataset.field!;
    if (field === 'color') item.hex = input.value.toUpperCase(); else if (field === 'hex' && !hexToRgb(input.value)) { input.setAttribute('aria-invalid', 'true'); return; } else (item as any)[field] = input.value;
    input.removeAttribute('aria-invalid'); if (field !== 'name') { renderSwatches(); recalcFrameCoverage(); } renderReport();
  }));
  swatchBox.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach(button => button.addEventListener('click', () => { swatches = swatches.filter(s => s.id !== Number(button.dataset.remove)); renderSwatches(); recalcFrameCoverage(); renderReport(); }));
}
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]!)); }
function activeVisions() { return [...document.querySelectorAll<HTMLInputElement>('input[name="simulation"]:checked')].map(x => x.value as Vision); }
function visibleWeight(i: number) { return frames.length ? frames.reduce((sum, frame) => sum + (frame.coverage[i] ?? 0), 0) / frames.length : 1 / swatches.length; }
function scorePair(a: number, b: number, vision: Vision) { const p = safePalette(), sep = separation(simulate(p[a], vision), simulate(p[b], vision)); const lum = contrast(simulate(p[a], vision), simulate(p[b], vision)); const presence = Math.sqrt(visibleWeight(a) * visibleWeight(b)); return { sep, lum, presence, score: (Math.max(0, 52 - sep) / 52) * (.45 + presence) }; }
function labelVision(v: Vision) { return ({ normal: 'Original', protanopia: 'Protanopia', deuteranopia: 'Deuteranopia', tritanopia: 'Tritanopia' })[v]; }
function suggestedHex(index: number, other: number, vision: Vision) { const original = safePalette()[index], target = safePalette()[other]; let best = original, bestSep = separation(simulate(original, vision), simulate(target, vision)); for (const n of [-.42, -.34, -.26, -.18, .18, .26, .34, .42]) { const candidate = mix(original, n); const test = separation(simulate(candidate, vision), simulate(target, vision)); if (test > bestSep) { best = candidate; bestSep = test; } } return rgbToHex(best); }
function renderReport() {
  const visions = activeVisions();
  if (visions.length === 0) { report.innerHTML = '<div class="empty-report"><strong>Choose a viewing condition.</strong><p>Keeping Original on is useful for preserving the relationship you started with.</p></div>'; return; }
  const findings: { a: number; b: number; v: Vision; sep: number; lum: number; score: number }[] = [];
  for (let a = 0; a < swatches.length; a++) for (let b = a + 1; b < swatches.length; b++) visions.forEach(v => findings.push({ a, b, v, ...scorePair(a, b, v) }));
  findings.sort((x, y) => y.score - x.score);
  const palette = safePalette();
  const critical = findings.filter(f => f.sep < 52).slice(0, 5);
  const view = visions[0];
  report.innerHTML = `<div class="analysis-summary"><div><span class="metric">${critical.length}</span><span>pair${critical.length === 1 ? '' : 's'} to inspect</span></div><p>${frames.length ? `Weighted across ${frames.length} frame${frames.length === 1 ? '' : 's'}.` : 'Swatch-only study — add frames to weight by visible area.'}</p><div class="preview-strip" aria-hidden="true">${palette.map(c => `<span style="background:${rgbToHex(simulate(c, view))}"></span>`).join('')}</div></div>${critical.length ? `<ol class="findings">${critical.map((f, i) => findingHtml(f, i)).join('')}</ol>` : '<div class="empty-report"><strong>Your selected conditions show clear pair separation.</strong><p>Try representative frames to catch where a frequently-used pair may still need attention.</p></div>'}<p class="fineprint">Separation below 52 / 255 is flagged. This is an approximate screen-colour heuristic, not conformance certification.</p>`;
  report.querySelectorAll<HTMLButtonElement>('[data-apply]').forEach(button => button.addEventListener('click', () => { const s = swatches.find(x => x.id === Number(button.dataset.apply)); if (!s) return; s.hex = button.dataset.hex!; renderSwatches(); recalcFrameCoverage(); renderReport(); }));
}
function findingHtml(f: { a:number; b:number; v:Vision; sep:number; lum:number }, rank: number) { const a = swatches[f.a], b = swatches[f.b], candidate = suggestedHex(f.a, f.b, f.v); const simulatedA = rgbToHex(simulate(safePalette()[f.a], f.v)), simulatedB = rgbToHex(simulate(safePalette()[f.b], f.v)); const text = contrast(hexToRgb(candidate)!, [255, 255, 255]) >= contrast(hexToRgb(candidate)!, [24, 22, 19]) ? '#fff' : '#181613'; return `<li class="finding"><div class="finding-number">0${rank + 1}</div><div class="pair"><span class="dot" style="background:${simulatedA}"></span><strong>${escapeHtml(a.name)}</strong><span aria-hidden="true">↔</span><span class="dot" style="background:${simulatedB}"></span><strong>${escapeHtml(b.name)}</strong><p>${labelVision(f.v)}: <b>${Math.round(f.sep)} / 255</b> separation · ${f.lum.toFixed(1)}:1 luminance contrast${frames.length ? ` · ${Math.round((visibleWeight(f.a) + visibleWeight(f.b)) * 50)}% visible area` : ''}</p></div><div class="fix"><span>Bounded lightness alternative</span><button type="button" data-apply="${a.id}" data-hex="${candidate}" style="--suggest:${candidate};--suggest-text:${text}">Use ${candidate}</button></div></li>`; }
async function loadFrames(files: FileList) {
  const selected = [...files].slice(0, Math.max(0, 6 - frames.length));
  if (!selected.length) { frameError.textContent = frames.length >= 6 ? 'You can compare up to six frames. Remove one before adding another.' : ''; return; }
  frameError.textContent = files.length > selected.length ? 'Only the first six frames are used.' : '';
  for (const file of selected) { if (file.size > 8_000_000) { frameError.textContent = `${file.name} is over 8 MB; choose a smaller frame.`; continue; } const url = URL.createObjectURL(file); const image = new Image(); await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(); image.src = url; }).catch(() => { frameError.textContent = `Could not read ${file.name}. Try PNG, JPEG, WebP, or GIF.`; }); if (image.complete && image.naturalWidth) frames.push({ name: file.name, url, image, coverage: [] }); }
  renderFrames(); recalcFrameCoverage(); renderReport();
}
function renderFrames() { frameEmpty.hidden = frames.length > 0; frameList.innerHTML = frames.map((frame, i) => `<figure class="frame"><img src="${frame.url}" alt="Selected frame: ${escapeHtml(frame.name)}" /><figcaption>${escapeHtml(frame.name)} <button type="button" data-frame="${i}" aria-label="Remove ${escapeHtml(frame.name)}">Remove</button></figcaption></figure>`).join(''); frameList.querySelectorAll<HTMLButtonElement>('[data-frame]').forEach(b => b.addEventListener('click', () => { const [removed] = frames.splice(Number(b.dataset.frame), 1); URL.revokeObjectURL(removed.url); renderFrames(); recalcFrameCoverage(); renderReport(); })); }
function recalcFrameCoverage() { const palette = safePalette(); frames.forEach(frame => { const canvas = document.createElement('canvas'), longest = 120, scale = Math.min(1, longest / Math.max(frame.image.naturalWidth, frame.image.naturalHeight)); canvas.width = Math.max(1, Math.round(frame.image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(frame.image.naturalHeight * scale)); const ctx = canvas.getContext('2d', { willReadFrequently: true })!; ctx.drawImage(frame.image, 0, 0, canvas.width, canvas.height); const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data, counts = palette.map(() => 0), total = Math.max(1, pixels.length / 4); for (let i = 0; i < pixels.length; i += 4) { if (pixels[i + 3] < 80) continue; counts[nearest([pixels[i], pixels[i + 1], pixels[i + 2]], palette).index]++; } frame.coverage = counts.map(c => c / total); }); }
function exportReport() { const data = { generatedAt: new Date().toISOString(), assumptions: 'Local sRGB matrix approximations; flagged simulated separation below 52 / 255.', swatches, frames: frames.map(f => ({ name: f.name, estimatedCoverage: f.coverage })), selectedSimulations: activeVisions() }; const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'palette-a11y-field-notes.json'; a.click(); URL.revokeObjectURL(url); }
el('addSwatch').addEventListener('click', () => { swatches.push({ id: nextId++, name: `New mark ${swatches.length + 1}`, hex: '#7C5C8E' }); renderSwatches(); renderReport(); });
el('resetPalette').addEventListener('click', () => { swatches = structuredClone(starter); nextId = 6; renderSwatches(); recalcFrameCoverage(); renderReport(); });
const frameInput = el<HTMLInputElement>('frames');
frameInput.addEventListener('change', () => { if (frameInput.files) loadFrames(frameInput.files); frameInput.value = ''; });
document.querySelectorAll<HTMLInputElement>('input[name="simulation"]').forEach(i => i.addEventListener('change', renderReport));
el('exportReport').addEventListener('click', exportReport);
const updateOffline = () => el('offline').hidden = navigator.onLine; addEventListener('online', updateOffline); addEventListener('offline', updateOffline); updateOffline(); renderSwatches(); renderReport();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
