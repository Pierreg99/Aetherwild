import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = require(join(root, 'js/data.js'));
const engine = require(join(root, 'js/engine.js'));

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL ' + msg);
  } else {
    passed += 1;
  }
}

assert(data.RESONANTS.length >= 8, 'at least 8 resonants');
const names = data.RESONANTS.map((r) => r.name);
assert(new Set(names).size === names.length, 'unique names');
const ids = data.RESONANTS.map((r) => r.id);
assert(new Set(ids).size === ids.length, 'unique ids');
const statSig = new Set(data.RESONANTS.map((r) => JSON.stringify(r.baseStats)));
assert(statSig.size === data.RESONANTS.length, 'distinct stat lines');
const learnSig = new Set(data.RESONANTS.map((r) => r.learnset.join(',')));
assert(learnSig.size === data.RESONANTS.length, 'distinct motif lists');

for (const r of data.RESONANTS) {
  const total = Object.values(r.baseStats).reduce((a, b) => a + b, 0);
  assert(total >= 290 && total <= 620, r.name + ' base total ' + total);
  assert(data.HARMONICS.includes(r.primary), r.name + ' primary harmonic');
  for (const h of data.HARMONICS) assert(typeof r.baseWard[h] === 'number', r.name + ' ward ' + h);
  for (const mid of r.learnset) assert(engine.motif(mid), r.name + ' motif ' + mid);
}

for (const h of data.HARMONICS) {
  assert(engine.strongAgainst(h).length === 2, h + ' strong count');
  assert(engine.weakAgainst(h).length === 2, h + ' weak count');
}

const save = engine.freshSave('Surveyor', data.FIRST_RESONANCE[0], 7);
for (const key of data.SAVE_SCHEMA_KEYS) assert(Object.prototype.hasOwnProperty.call(save, key), 'save key ' + key);
assert(save.choir.length === 1 && save.reserve === null, 'starts with one choir seat');
assert(save.choir.length <= data.CHOIR_MAX, 'choir cap');

const a = save.choir[0];
const foe = engine.makeInstance(save, 'wynveil', 6);
const motif = engine.motif(a.knownMotifs[0]);
const dmg = engine.computeDamage(a, foe, motif, 0.2);
assert(Number.isInteger(dmg) && dmg >= 1, 'damage is a positive integer');
assert(engine.computeDamage(a, foe, Object.assign({}, motif, { power: 0 }), 0.2) === 0, 'zero power deals none');

const seq = [engine.rngNext(99)];
seq.push(engine.rngNext(seq[0].seed));
const again = [engine.rngNext(99)];
again.push(engine.rngNext(again[0].seed));
assert(seq[0].value === again[0].value && seq[1].value === again[1].value, 'rng is deterministic');

const wild = engine.makeInstance(save, 'mortide', 4);
const sp = engine.species(wild.speciesId);
const battle = engine.createBattle([wild], 'wild', null);
const before = engine.initialGuard(sp, wild.level);
engine.stepBattle(save, battle, { type: 'attune-start' });
assert(battle.attune && battle.attune.guard === before, 'attunement opens at computed guard');
const dom = engine.dominantHarmonic(sp.baseWard);
engine.stepBattle(save, battle, { type: 'hum', harmonic: dom, pitch: null, kindling: true });
assert(battle.attune.guard === Math.max(0, before - 55), 'spike hum and kindling lower guard by 55');
const wrong = engine.createBattle([engine.makeInstance(save, 'mortide', 4)], 'wild', null);
engine.stepBattle(save, wrong, { type: 'attune-start' });
const g0 = wrong.attune.guard;
engine.stepBattle(save, wrong, { type: 'hum', harmonic: null, pitch: sp.pitch === 'Low' ? 'High' : 'Low', kindling: false });
assert(wrong.attune.guard === g0 + 15, 'wrong hum raises guard');

const thin = engine.freshSave('Surveyor', 'veshcrag', 3);
thin.choir[0].vigor = 1;
const flee = engine.createBattle([engine.makeInstance(thin, 'draygust', 3)], 'wild', null);
engine.stepBattle(thin, flee, { type: 'attune-start' });
assert(flee.result === 'fled', 'thin vigor cannot attune');

let wins = 0;
let losses = 0;
for (let i = 0; i < 40; i++) {
  const s = engine.freshSave('Surveyor', data.RESONANTS[i % data.RESONANTS.length].id, 1000 + i);
  s.choir[0].level = 8;
  s.choir[0].stats = engine.statsAt(engine.species(s.choir[0].speciesId).baseStats, 8);
  s.choir[0].vigor = s.choir[0].stats.vigor;
  const other = data.RESONANTS[(i + 3) % data.RESONANTS.length].id;
  const b = engine.createBattle([engine.makeInstance(s, other, 4 + (i % 4))], 'wild', null);
  let guard = 0;
  while (b.result === 'ongoing' && guard < 60) {
    const actor = s.choir[s.active];
    for (const id of actor.knownMotifs) actor.cadence[id] = engine.motif(id).cadenceMax;
    const f = engine.foe(b);
    for (const id of f.knownMotifs) f.cadence[id] = engine.motif(id).cadenceMax;
    engine.stepBattle(s, b, { type: 'motif', motifId: actor.knownMotifs[guard % actor.knownMotifs.length] });
    guard += 1;
    assert(actor.vigor >= 0 && f.vigor >= 0, 'vigor stays non-negative');
  }
  assert(b.result === 'win' || b.result === 'loss', 'battle ' + i + ' ends, got ' + b.result);
  if (b.result === 'win') wins += 1;
  if (b.result === 'loss') losses += 1;
}
assert(wins > 0, 'some wins');

const loseSave = engine.freshSave('Surveyor', 'brinember', 5);
loseSave.choir[0].vigor = 1;
const bully = engine.makeInstance(loseSave, 'wynveil', 12);
bully.stats.tempo = 400;
bully.knownMotifs = ['gust-thread'];
bully.cadence['gust-thread'] = 14;
const lost = engine.createBattle([bully], 'wild', null);
engine.stepBattle(loseSave, lost, { type: 'motif', motifId: loseSave.choir[0].knownMotifs[0] });
assert(lost.result === 'loss', 'a single quiet Choir ends in loss');


const banned = [
  'pokemon', 'pokémon', 'pikachu', 'charizard', 'bulbasaur', 'squirtle', 'mewtwo',
  'pokeball', 'pokéball', 'pokedex', 'pokédex', 'jigglypuff', 'eevee', 'charmander',
  'snorlax', 'lucario', 'greninja', 'gyarados'
];
const skip = new Set(['test/check.mjs']);
function walk(dir, rel) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const r = rel ? rel + '/' + name : name;
    if (name === '.git' || name === 'node_modules') continue;
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, r);
    else if (/\.(js|mjs|html|css|md|txt)$/.test(name) && !skip.has(r)) {
      const text = readFileSync(abs, 'utf8').toLowerCase();
      for (const word of banned) assert(!text.includes(word), r + ' contains ' + word);
      assert(!/\btrainer\b/.test(text), r + ' contains trainer');
      assert(!/\bgym\b/.test(text), r + ' contains gym');
    }
  }
}
walk(root, '');

for (const row of data.ZONES.yard.map) assert(row.length === data.ZONES.yard.map[0].length, 'map row width');
assert(data.ZONES.yard.map.some((row) => row.includes('@')), 'spawn exists');
assert(data.ZONES.yard.map.some((row) => row.includes('S')), 'sanctum exists');
for (const slot of data.WARDENS.solm.team) assert(engine.species(slot.speciesId), 'warden species');

assert(data.HARMONICS.length === 9, 'nine harmonics');
assert(data.RESONANTS.length >= 18, 'expanded roster');
assert(Object.keys(data.ZONES).length >= 4, 'four zones');
assert(Object.keys(data.WARDENS).length >= 4, 'four sanctums');
for (const zone of Object.values(data.ZONES)) {
  const width = zone.map[0].length;
  for (const row of zone.map) assert(row.length === width, zone.id + ' row width');
  assert(zone.map.some((row) => row.includes('e') || row.includes('@')), zone.id + ' has an entry');
  assert(data.WARDENS[zone.wardenId], zone.id + ' warden');
  for (const dir of Object.keys(zone.links)) {
    const dest = zone.links[dir];
    if (!dest) continue;
    assert(data.ZONES[dest], zone.id + ' link ' + dir);
    const mark = dir === 'D' ? 'e' : 'r';
    assert(data.ZONES[dest].map.some((row) => row.includes(mark)), dest + ' landing ' + mark);
  }
  for (const id of zone.encounters) assert(engine.species(id), zone.id + ' encounter ' + id);
}
for (const warden of Object.values(data.WARDENS)) {
  assert(warden.team.length >= 2, warden.id + ' brings more than one');
  for (const slot of warden.team) assert(engine.species(slot.speciesId), warden.id + ' species');
}

const locked = engine.freshSave('Surveyor', 'brinember', 11);
locked.choir.push(engine.makeInstance(locked, 'mortide', 6));
locked.choir[0].vigor = 1;
const lockFoe = engine.makeInstance(locked, 'wynveil', 12);
lockFoe.stats.tempo = 500;
lockFoe.knownMotifs = ['gust-thread'];
lockFoe.cadence['gust-thread'] = 14;
const lockBattle = engine.createBattle([lockFoe], 'warden', 'quorin', { lockSwitch: true });
engine.stepBattle(locked, lockBattle, { type: 'motif', motifId: locked.choir[0].knownMotifs[0] });
assert(lockBattle.result === 'loss', 'locked sanctum does not call the bench');

const refused = engine.freshSave('Surveyor', 'brinember', 13);
refused.choir[0].stats.tempo = 500;
refused.choir[0].knownMotifs = refused.choir[0].knownMotifs.concat(['tide-murmur']);
refused.choir[0].cadence['tide-murmur'] = 14;
const calm = engine.makeInstance(refused, 'veshcrag', 3);
calm.stats.tempo = 1;
calm.vigor = 80;
const refuseBattle = engine.createBattle([calm], 'warden', 'odel', { primaryLock: true });
const refuseLogs = engine.stepBattle(refused, refuseBattle, { type: 'motif', motifId: 'tide-murmur' });
assert(refuseLogs.some((line) => line.indexOf('refuses') !== -1), 'sanctum refuses another harmonic');
assert(calm.vigor === 80, 'refused motif deals no vigor loss');



const young = engine.freshSave('Surveyor', 'brinember', 21);
assert(engine.evaluateAscension(young.choir[0]) === null, 'ascension waits for level and resonance');
young.choir[0].level = 16;
young.choir[0].resonance = 120;
young.choir[0].battleStats.bondPeak = 120;
assert(engine.evaluateAscension(young.choir[0]).to === 'tindflare', 'bond peak ascension');
const tide = engine.freshSave('Surveyor', 'mortide', 22).choir[0];
tide.level = 16;
tide.resonance = 120;
tide.battleStats.motifUses.Kindling = 4;
assert(engine.evaluateAscension(tide) === null, 'four kindling uses are short');
tide.battleStats.motifUses.Kindling = 5;
assert(engine.evaluateAscension(tide).to === 'lumtide', 'kindling ascension');
const mesa = engine.freshSave('Surveyor', 'veshcrag', 23).choir[0];
mesa.level = 16;
mesa.resonance = 120;
assert(engine.evaluateAscension(mesa).to === 'oskslab', 'no-faint ascension');
mesa.battleStats.fainted = true;
assert(engine.evaluateAscension(mesa) === null, 'a faint blocks that ascension');

const guest = engine.species('draygust');
guest.ascension = { to: 'wynveil', minLevel: 1, minResonance: 0, condition: { kind: 'biome', biomeId: 'yard' } };
const walker = engine.freshSave('Surveyor', 'draygust', 24).choir[0];
walker.battleStats.biomes.yard = true;
assert(engine.evaluateAscension(walker).to === 'wynveil', 'zone condition');
guest.ascension = { to: 'wynveil', minLevel: 1, minResonance: 0, condition: { kind: 'harmonic_affinity', harmonic: 'Draft', wins: 2 } };
walker.battleStats.winsByHarmonic.Draft = 2;
assert(engine.evaluateAscension(walker).to === 'wynveil', 'harmonic win condition');
delete guest.ascension;

const longSave = engine.freshSave('Surveyor', 'brinember', 25);
longSave.choir[0].stats.tempo = 900;
longSave.choir[0].vigor = longSave.choir[0].stats.vigor;
const wall = engine.makeInstance(longSave, 'pellslab', 4);
wall.stats.tempo = 1;
wall.stats.edge = 99999;
wall.stats.guard = 99999;
wall.stats.vigor = 500;
wall.vigor = 500;
const longBattle = engine.createBattle([wall], 'wild', null);
longBattle.phrases = 199;
engine.stepBattle(longSave, longBattle, { type: 'motif', motifId: longSave.choir[0].knownMotifs[0] });
assert(longBattle.phrases >= 200, 'phrase counter reaches the cap');
assert(longBattle.result === 'win' || longBattle.result === 'loss', 'a long phrase still ends');

console.log('resonants: ' + data.RESONANTS.length);
console.log('assertions passed: ' + passed);
console.log('assertions failed: ' + failed);
console.log('scripted wins: ' + wins + ' losses: ' + losses);
if (failed) process.exit(1);
