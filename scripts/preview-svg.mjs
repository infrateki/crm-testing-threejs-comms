// Generate sample SVGs to disk for visual inspection
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateMiaTerminal } from '../src/engine/procedural/svg/MiaTerminal.tsx';
import { generateLgaTerminal } from '../src/engine/procedural/svg/LgaTerminal.tsx';
import { generateDfwTerminal } from '../src/engine/procedural/svg/DfwTerminal.tsx';
import { generateMcoTerminal } from '../src/engine/procedural/svg/McoTerminal.tsx';
import { generateFederalBuilding } from '../src/engine/procedural/svg/FederalBuilding.tsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'svg-preview');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const scenes = [
  ['mia.svg', generateMiaTerminal({ seed: 42 })],
  ['lga.svg', generateLgaTerminal({ seed: 42 })],
  ['dfw.svg', generateDfwTerminal({ seed: 42 })],
  ['mco.svg', generateMcoTerminal({ seed: 42 })],
  ['federal.svg', generateFederalBuilding({ seed: 42 })],
];

for (const [name, svg] of scenes) {
  fs.writeFileSync(path.join(outDir, name), svg);
  console.log(`Wrote ${name} (${(svg.length / 1024).toFixed(1)}KB)`);
}

// Also write a combined index.html for browser preview
const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>SVG Illustrations Preview</title>
<style>
body { font-family: system-ui; background: #f0ede4; padding: 20px; margin: 0; }
.scene { background: #FAF8F3; margin: 16px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 3px; overflow: hidden; }
h2 { margin: 0; padding: 12px 16px; font-family: serif; font-weight: 900; background: #1a1a1a; color: #FAF8F3; }
img { display: block; width: 100%; height: auto; }
</style></head><body>
<h1>BIMSEARCH — Titan/Arcus Architectural Illustrations</h1>
${scenes.map(([n]) => `<div class="scene"><h2>${n.replace('.svg','').toUpperCase()}</h2><img src="${n}" /></div>`).join('\n')}
</body></html>`;
fs.writeFileSync(path.join(outDir, 'index.html'), html);
console.log(`\nOpen: ${path.join(outDir, 'index.html')}`);
