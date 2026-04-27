// Quick script to count SVG elements per scene
import { generateMiaTerminal } from '../src/engine/procedural/svg/MiaTerminal.tsx';
import { generateLgaTerminal } from '../src/engine/procedural/svg/LgaTerminal.tsx';
import { generateDfwTerminal } from '../src/engine/procedural/svg/DfwTerminal.tsx';
import { generateMcoTerminal } from '../src/engine/procedural/svg/McoTerminal.tsx';
import { generateFederalBuilding } from '../src/engine/procedural/svg/FederalBuilding.tsx';

const scenes = [
  ['MIA Terminal', generateMiaTerminal],
  ['LGA Terminal', generateLgaTerminal],
  ['DFW Terminal', generateDfwTerminal],
  ['MCO Terminal', generateMcoTerminal],
  ['Federal Building', generateFederalBuilding],
];

for (const [name, gen] of scenes) {
  const svg = gen({ seed: 42 });
  const paths = (svg.match(/<path /g) || []).length;
  const lines = (svg.match(/<line /g) || []).length;
  const rects = (svg.match(/<rect /g) || []).length;
  const circles = (svg.match(/<circle /g) || []).length;
  const total = paths + lines + rects + circles;
  console.log(`${name.padEnd(20)} total=${total}  paths=${paths}  lines=${lines}  rects=${rects}  circles=${circles}  size=${(svg.length / 1024).toFixed(1)}KB`);
}
