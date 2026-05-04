import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const configPath = path.join(repoRoot, 'docs', 'grading-system-v2.json');
const scoresPath = process.argv[2]
  ? path.resolve(repoRoot, process.argv[2])
  : path.join(repoRoot, 'docs', 'current-scores.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const config = readJson(configPath);
const scoreData = readJson(scoresPath);

const floor = config.rules.globalMinimum;
const categories = config.categories;
const scores = scoreData.scores;

const missing = [];
const belowFloor = [];
let weightedOverall = 0;

for (const c of categories) {
  const score = scores[c.name];
  if (typeof score !== 'number') {
    missing.push(c.name);
    continue;
  }
  weightedOverall += score * c.weight;
  if (score < floor) {
    belowFloor.push({ name: c.name, score });
  }
}

const criticalBelow = belowFloor.filter((item) =>
  config.rules.criticalCategories.includes(item.name)
);

console.log('Audit Gate');
console.log(`- Score file: ${path.relative(repoRoot, scoresPath)}`);
console.log(`- Floor: ${floor.toFixed(1)}`);
console.log(`- Weighted overall: ${weightedOverall.toFixed(2)} / 10`);

if (missing.length) {
  console.log('- Missing categories:');
  for (const name of missing) console.log(`  - ${name}`);
}

if (belowFloor.length) {
  console.log('- Categories below floor:');
  for (const item of belowFloor) {
    console.log(`  - ${item.name}: ${item.score.toFixed(1)}`);
  }
}

if (criticalBelow.length) {
  console.log('- Critical categories below floor:');
  for (const item of criticalBelow) {
    console.log(`  - ${item.name}: ${item.score.toFixed(1)}`);
  }
}

const failed =
  missing.length > 0 ||
  belowFloor.length > 0 ||
  weightedOverall < floor;

if (failed) {
  console.log('Result: FAIL -> Enhancement loop required.');
  process.exit(1);
}

console.log('Result: PASS -> Release gate cleared.');
