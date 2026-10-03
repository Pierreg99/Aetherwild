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
assert(save.choir.length === 1 && Array.isArray(save.reserve) && save.reserve.length === 0, 'starts with one choir seat and an empty vault');
assert(save.shards === 0, 'starts without shards');
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
assert(data.RESONANTS.length === 81, 'index holds 81 resonants');
assert(data.MOTIFS.length === 120, 'motif count is 120');
assert(new Set(data.MOTIFS.map((m) => m.id)).size === 120, 'motif ids are unique');
assert(new Set(data.MOTIFS.map((m) => m.name)).size === 120, 'motif names are unique');
for (const motifRow of data.MOTIFS) {
  assert(data.HARMONICS.includes(motifRow.harmonic), 'motif harmonic ' + motifRow.id);
  assert(motifRow.power >= 0 && motifRow.accuracy > 0, 'motif numbers ' + motifRow.id);
}
assert(data.CHORUS.length === 4, 'chorus has four voices');
for (const voice of data.CHORUS) {
  assert(voice.team.length >= 2, voice.id + ' brings a phrase');
  for (const slot of voice.team) assert(engine.species(slot.speciesId), voice.id + ' species');
}
assert(data.PRIME_VOICE.team.length >= 2, 'prime voice brings a phrase');
for (const slot of data.PRIME_VOICE.team) assert(engine.species(slot.speciesId), 'prime species');
assert(data.ZONES.foundry.links.D === 'chorus', 'chorus hall is past the foundry');
assert(data.ZONES.chorus.requiresChoir === true, 'chorus waits on the eight sanctums');
assert(data.ZONES.chorus.map.some((row) => row.includes('C')), 'chorus dais exists');

assert(Object.keys(data.ZONES).length === 9, 'eight sanctum zones plus the chorus hall');
assert(Object.keys(data.WARDENS).length === 8, 'eight sanctums');
for (const zone of Object.values(data.ZONES)) {
  const width = zone.map[0].length;
  for (const row of zone.map) assert(row.length === width, zone.id + ' row width');
  assert(zone.map.some((row) => row.includes('e') || row.includes('@')), zone.id + ' has an entry');
  if (zone.wardenId) assert(data.WARDENS[zone.wardenId], zone.id + ' warden');
  else assert(zone.id === 'chorus', zone.id + ' without a warden');
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

const reach = new Set(['yard']);
const queue = ['yard'];
while (queue.length) {
  const id = queue.pop();
  const links = data.ZONES[id].links;
  for (const dest of Object.values(links)) {
    if (dest && !reach.has(dest)) {
      reach.add(dest);
      queue.push(dest);
    }
  }
}
for (const id of Object.keys(data.ZONES)) assert(reach.has(id), id + ' is reachable on foot');
const ruleKeys = Object.values(data.WARDENS).map((w) => JSON.stringify(w.rules));
assert(new Set(ruleKeys).size === ruleKeys.length, 'each sanctum trial is distinct');

const capSave = engine.freshSave('Surveyor', 'brinember', 31);
capSave.choir[0].stats.tempo = 900;
capSave.choir[0].vigor = 400;
capSave.choir[0].stats.vigor = 400;
const tank = engine.makeInstance(capSave, 'pellslab', 4);
tank.stats.tempo = 1;
tank.stats.edge = 99999;
tank.stats.guard = 99999;
tank.vigor = 500;
tank.stats.vigor = 500;
const capBattle = engine.createBattle([tank], 'warden', 'ulm', { phraseLimit: 8 });
capBattle.phrases = 7;
engine.stepBattle(capSave, capBattle, { type: 'motif', motifId: capSave.choir[0].knownMotifs[0] });
assert(capBattle.result === 'loss', 'a phrase past the limit is a loss');
const quick = engine.freshSave('Surveyor', 'brinember', 32);
quick.choir[0].stats.tempo = 900;
const frail = engine.makeInstance(quick, 'draygust', 2);
frail.vigor = 1;
frail.stats.tempo = 1;
const quickBattle = engine.createBattle([frail], 'warden', 'ulm', { phraseLimit: 8 });
engine.stepBattle(quick, quickBattle, { type: 'motif', motifId: 'flare-lattice' });
assert(quickBattle.result === 'win', 'a short phrase can still clear the limit');

const kindSave = engine.freshSave('Surveyor', 'brinember', 33);
kindSave.choir[0].stats.tempo = 900;
const kindFoe = engine.makeInstance(kindSave, 'veshcrag', 4);
kindFoe.stats.tempo = 1;
kindFoe.vigor = 80;
const kindBattle = engine.createBattle([kindFoe], 'warden', 'zeph', { kindlingOnly: true });
const heavy = engine.stepBattle(kindSave, kindBattle, { type: 'motif', motifId: 'flare-lattice' });
assert(heavy.some((line) => line.indexOf('Kindling') !== -1), 'heavy motif is refused');
assert(kindFoe.vigor === 80, 'refused kindling rule deals none');
const spark = engine.freshSave('Surveyor', 'brinember', 34);
spark.choir[0].stats.tempo = 900;
const sparkFoe = engine.makeInstance(spark, 'veshcrag', 4);
sparkFoe.stats.tempo = 1;
sparkFoe.vigor = 80;
const sparkBattle = engine.createBattle([sparkFoe], 'warden', 'zeph', { kindlingOnly: true });
engine.stepBattle(spark, sparkBattle, { type: 'motif', motifId: 'hush-ember' });
assert(sparkFoe.vigor < 80, 'kindling still lands');

const rot = engine.freshSave('Surveyor', 'brinember', 35);
rot.choir.push(engine.makeInstance(rot, 'mortide', 6));
rot.choir[0].stats.tempo = 900;
rot.choir[0].vigor = 200;
rot.choir[0].stats.vigor = 200;
const rotFoe = engine.makeInstance(rot, 'pellslab', 3);
rotFoe.stats.tempo = 1;
rotFoe.stats.edge = 99999;
rotFoe.vigor = 400;
rotFoe.stats.vigor = 400;
const rotBattle = engine.createBattle([rotFoe], 'warden', 'karu', { rotate: true });
engine.stepBattle(rot, rotBattle, { type: 'motif', motifId: rot.choir[0].knownMotifs[0] });
assert(rotBattle.mustSwitch === true, 'rotation asks for another voice');
const same = engine.stepBattle(rot, rotBattle, { type: 'switch', index: 0 });
assert(same.some((line) => line.indexOf('different voice') !== -1), 'same voice is refused');
assert(rotBattle.mustSwitch === true, 'rotation stays open');
engine.stepBattle(rot, rotBattle, { type: 'switch', index: 1 });
assert(rotBattle.mustSwitch === false, 'a different voice satisfies rotation');

function firstHit(rules) {
  const s = engine.freshSave('Surveyor', 'brinember', 36);
  s.choir[0].stats.tempo = 900;
  const f = engine.makeInstance(s, 'veshcrag', 5);
  f.stats.tempo = 1;
  f.vigor = 200;
  const b = engine.createBattle([f], 'warden', 'tal', rules);
  const logs = engine.stepBattle(s, b, { type: 'motif', motifId: 'ember-ring' });
  const line = logs.find((entry) => entry.indexOf('loses') !== -1);
  const n = Number(line.match(/loses (\d+)/)[1]);
  return n;
}
const openHit = firstHit(null);
const softHit = firstHit({ openingSoften: true });
assert(softHit < openHit, 'opening phrase is softer');
assert(softHit >= 1, 'soft phrase still lands');




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


function clearVoice(save, kind) {
  save.choir[0].stats.tempo = 900;
  save.choir[0].vigor = save.choir[0].stats.vigor;
  const foe = engine.makeInstance(save, 'draygust', 2);
  foe.vigor = 1;
  foe.stats.tempo = 1;
  const battle = engine.createBattle([foe], kind, kind);
  engine.stepBattle(save, battle, { type: 'motif', motifId: 'ember-ring' });
  assert(battle.result === 'win', kind + ' phrase can be won');
  return battle;
}
const hall = engine.freshSave('Surveyor', 'brinember', 41);
const blocked = engine.mayEnter(hall, data.ZONES.foundry, 'D');
assert(blocked.ok === false && blocked.reason === 'sanctum', 'foundry gate waits on its sanctum');
hall.flags.sanctums.tal = true;
const early = engine.mayEnter(hall, data.ZONES.foundry, 'D');
assert(early.ok === false && early.reason === 'chorus', 'chorus waits until every sanctum is answered');
for (const id of Object.keys(data.WARDENS)) hall.flags.sanctums[id] = true;
const open = engine.mayEnter(hall, data.ZONES.foundry, 'D');
assert(open.ok === true && open.dest === 'chorus', 'eight sanctums open the chorus');
for (let i = 0; i < data.CHORUS.length; i++) clearVoice(hall, 'chorus');
assert(hall.flags.chorusIndex === 4, 'four chorus wins advance the sequence');
assert(hall.flags.chorusClear === true, 'chorus clear is a real flag');
clearVoice(hall, 'prime');
assert(hall.flags.primeClear === true, 'prime voice win is recorded');
assert(hall.storyBeat === 'prime', 'prime voice sets the ending beat');

assert(data.LEVEL_CAP === 50, 'level cap is 50');
const capped = engine.freshSave('Surveyor', 'draygust', 51);
capped.choir[0].level = 49;
capped.choir[0].experience = engine.experienceToAdvance(49) * 4;
const capFoe = engine.makeInstance(capped, 'wynveil', 20);
engine.grantResonance(capped, capFoe);
assert(capped.choir[0].level === 50, 'progression stops at 50');
const beforeXp = capped.choir[0].experience;
engine.grantResonance(capped, capFoe);
assert(capped.choir[0].level === 50, 'a second grant stays at 50');
assert(capped.choir[0].experience > beforeXp, 'experience can still accrue at the cap');
assert(capped.shards > 0, 'a quieted foe leaves shards');

function ready(id, seed) {
  const inst = engine.freshSave('Surveyor', id, seed).choir[0];
  inst.level = 32;
  inst.resonance = 180;
  return inst;
}
const wreath = ready('tindflare', 61);
assert(engine.evaluateAscension(wreath) === null, 'third stage still wants a bond peak');
wreath.battleStats.bondPeak = 180;
assert(engine.evaluateAscension(wreath).to === 'tindwreath', 'tindflare third stage');
const wreathSave = engine.freshSave('Surveyor', 'tindflare', 62);
wreathSave.choir[0] = wreath;
assert(engine.tryAscend(wreathSave, wreath, []), 'third stage applies');
assert(wreath.speciesId === 'tindwreath', 'tindflare becomes tindwreath');
const well = ready('lumtide', 63);
well.battleStats.motifUses.Kindling = 11;
assert(engine.evaluateAscension(well) === null, 'eleven kindling uses are short of the third stage');
well.battleStats.motifUses.Kindling = 12;
assert(engine.evaluateAscension(well).to === 'lumwell', 'lumtide third stage');
const spire = ready('oskslab', 64);
assert(engine.evaluateAscension(spire).to === 'oskspire', 'oskslab third stage');
spire.battleStats.fainted = true;
assert(engine.evaluateAscension(spire) === null, 'a faint still blocks the third stage');
for (const id of ['brinember', 'tindflare', 'mortide', 'lumtide', 'veshcrag', 'oskslab']) {
  assert(engine.species(id), 'existing line kept ' + id);
}

assert(data.VAULT_SEATS === 3, 'vault has three seats');
const box = engine.freshSave('Surveyor', 'brinember', 71);
for (let i = 0; i < 3; i++) assert(engine.placeAttuned(box, engine.makeInstance(box, 'mortide', 5)) === 'choir', 'choir fills before the vault');
assert(box.choir.length === 4, 'choir stays at four');
for (let i = 0; i < 3; i++) assert(engine.placeAttuned(box, engine.makeInstance(box, 'veshcrag', 5)) === 'reserve', 'vault seat ' + (i + 1));
assert(box.reserve.length === 3, 'vault holds three');
assert(engine.placeAttuned(box, engine.makeInstance(box, 'draygust', 5)) === 'overflow', 'a fourth vault seat is refused');
assert(engine.storeReserve(box, 1) === false, 'a full vault does not take another');
const moved = engine.freshSave('Surveyor', 'brinember', 72);
engine.placeAttuned(moved, engine.makeInstance(moved, 'mortide', 5));
assert(engine.storeReserve(moved, 1) === true, 'a choir seat can move into the vault');
assert(moved.reserve.length === 1 && moved.choir.length === 1, 'vault seat is occupied');
const legacy = engine.freshSave('Surveyor', 'brinember', 73);
legacy.reserve = engine.makeInstance(legacy, 'wynveil', 4);
engine.normalizeSave(legacy);
assert(Array.isArray(legacy.reserve) && legacy.reserve.length === 1, 'an old reserve seat becomes a vault seat');
delete legacy.shards;
engine.normalizeSave(legacy);
assert(legacy.shards === 0, 'a record without shards loads at zero');

const stall = data.ZONES.yard.map;
assert(stall.some((row) => row.includes('P')), 'yard stall tile');
let px = -1, py = -1, sx = -1, sy = -1;
for (let y = 0; y < stall.length; y++) {
  if (stall[y].indexOf('P') !== -1) { px = stall[y].indexOf('P'); py = y; }
  if (stall[y].indexOf('@') !== -1) { sx = stall[y].indexOf('@'); sy = y; }
}
const seen = new Set();
const q = [[sx, sy]];
const block = '#~NSDBCP';
let reached = false;
while (q.length) {
  const [x, y] = q.pop();
  const key = x + ',' + y;
  if (seen.has(key)) continue;
  seen.add(key);
  if (Math.abs(x - px) + Math.abs(y - py) === 1) reached = true;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (ny < 0 || nx < 0 || ny >= stall.length || nx >= stall[0].length) continue;
    const ch = stall[ny][nx];
    if (block.indexOf(ch) !== -1) continue;
    q.push([nx, ny]);
  }
}
assert(reached, 'the stall is reachable from the yard spawn');
const buyer = engine.freshSave('Surveyor', 'brinember', 81);
buyer.shards = 8;
buyer.choir[0].vigor = 1;
const bought = engine.buy(buyer, 'vigor-draught');
assert(bought.ok === true, 'vigor draught sells');
assert(buyer.choir[0].vigor === buyer.choir[0].stats.vigor, 'draught restores vigor');
assert(buyer.shards === 0, 'draught spends shards');
assert(engine.buy(buyer, 'vigor-draught').ok === false, 'an empty purse cannot buy');
buyer.shards = 6;
buyer.choir[0].cadence[buyer.choir[0].knownMotifs[0]] = 0;
const vial = engine.buy(buyer, 'cadence-vial');
assert(vial.ok === true, 'cadence vial sells');
assert(buyer.choir[0].cadence[buyer.choir[0].knownMotifs[0]] === engine.motif(buyer.choir[0].knownMotifs[0]).cadenceMax, 'vial refills cadence');
assert(buyer.shards === 0, 'vial spends shards');

const quota = { Kindling: 12, Pulse: 18, Guard: 14 };
const counts = {};
for (const motifRow of data.MOTIFS) counts[motifRow.cls] = (counts[motifRow.cls] || 0) + 1;
for (const cls of Object.keys(quota)) assert(counts[cls] === quota[cls], cls + ' quota ' + counts[cls]);
let harmonicCount = 0;
for (const cls of data.HARMONICS) {
  assert((counts[cls] || 0) > 0, cls + ' has motifs');
  harmonicCount += counts[cls] || 0;
}
assert(harmonicCount === 76, 'harmonic classes total 76');
assert(data.MOTIFS.length >= 120, 'motif count stays at least 120');
for (const motifRow of data.MOTIFS) {
  if (motifRow.cls !== 'Kindling') continue;
  assert(motifRow.power <= 40 && motifRow.harmony >= 30 && motifRow.harmony <= 55, motifRow.id + ' stays a kindling tool');
}

const gameSrc = readFileSync(join(root, 'js/game.js'), 'utf8');
assert(gameSrc.includes("playScore('encounter')"), 'encounter starts the score');
assert(gameSrc.includes("playScore('sanctum')"), 'sanctum clear starts the score');
assert(gameSrc.includes("playScore('ending')"), 'the ending starts the score');
const scoreBox = { started: [] };
function FakeAudio() {
  this.currentTime = 1;
  this.state = 'running';
  this.destination = {};
}
FakeAudio.prototype.resume = function () {};
FakeAudio.prototype.createOscillator = function () {
  return {
    type: 'sine',
    frequency: { value: 0 },
    connect: function () {},
    start: function (when) { scoreBox.started.push(when); },
    stop: function () {}
  };
};
FakeAudio.prototype.createGain = function () {
  return {
    gain: {
      setValueAtTime: function () {},
      exponentialRampToValueAtTime: function () {}
    },
    connect: function () {}
  };
};
globalThis.AudioContext = FakeAudio;
const audio = require(join(root, 'js/audio.js'));
const span = (name) => audio.phrases[name].reduce((sum, note) => sum + note.dur, 0);
assert(audio.phrases.encounter.length >= 4 && span('encounter') >= 1, 'encounter is more than a short tone');
assert(audio.phrases.sanctum.length >= 6 && span('sanctum') >= 2, 'sanctum clear is a phrase');
assert(audio.phrases.ending.length >= 8 && span('ending') >= 3, 'ending is a longer phrase');
const seenRows = new Set();
for (const name of ['encounter', 'sanctum', 'ending']) {
  const row = audio.phrases[name].map((note) => note.freq + ':' + note.dur).join(',');
  assert(!seenRows.has(row), name + ' is its own phrase');
  seenRows.add(row);
  for (const note of audio.phrases[name]) assert(note.freq >= 80 && note.freq <= 1200 && note.dur >= 0.1, name + ' note in range');
}
const startedBefore = scoreBox.started.length;
assert(audio.playScore('encounter') === true, 'encounter score schedules');
assert(audio.playScore('sanctum') === true, 'sanctum score schedules');
assert(audio.playScore('ending') === true, 'ending score schedules');
const voices = scoreBox.started.length - startedBefore;
const expected = (audio.phrases.encounter.length + audio.phrases.sanctum.length + audio.phrases.ending.length) * 2;
assert(voices === expected, 'each score note schedules a tone and an overtone, got ' + voices);

function armMotif(save, id) {
  const inst = save.choir[0];
  if (inst.knownMotifs.indexOf(id) === -1) inst.knownMotifs.push(id);
  inst.cadence[id] = 20;
  inst.stats.tempo = 900;
  inst.vigor = inst.stats.vigor;
}
const pulseStatus = data.MOTIFS.find((m) => m.effect && m.effect.kind === 'status' && m.effect.status === 'Scorched' && m.accuracy === 100);
const pulseRecoil = data.MOTIFS.find((m) => m.effect && m.effect.kind === 'recoil' && m.accuracy === 100);
const guardMotif = data.MOTIFS.find((m) => m.cls === 'Guard' && m.effect && m.effect.kind === 'ward' && m.accuracy === 100);
assert(pulseStatus && pulseRecoil && guardMotif, 'pulse and guard motifs carry effects');

const scorchedSave = engine.freshSave('Surveyor', 'brinember', 91);
armMotif(scorchedSave, pulseStatus.id);
const scorchedFoe = engine.makeInstance(scorchedSave, 'veshcrag', 8);
scorchedFoe.stats.tempo = 1;
scorchedFoe.stats.vigor = 400;
scorchedFoe.vigor = 400;
const scorchedBattle = engine.createBattle([scorchedFoe], 'wild', null);
const scorchedLogs = engine.stepBattle(scorchedSave, scorchedBattle, { type: 'motif', motifId: pulseStatus.id });
assert(scorchedFoe.status === 'Scorched', 'a pulse status lands');
assert(scorchedLogs.some((line) => line.indexOf('Scorched') !== -1), 'scorched is named in the phrase');
const midVigor = scorchedFoe.vigor;
const tickLogs = engine.stepBattle(scorchedSave, scorchedBattle, { type: 'motif', motifId: pulseStatus.id });
const chipLine = tickLogs.find((line) => line.indexOf('Scorched') !== -1 && line.indexOf('loses') !== -1);
assert(chipLine, 'scorched ticks at the next phrase');
const chip = Number(chipLine.match(/loses (\d+)/)[1]);
assert(chip === Math.max(1, Math.floor(scorchedFoe.stats.vigor / 16)), 'scorched chip is a sixteenth of vigor');
assert(scorchedFoe.vigor <= midVigor - chip, 'the chip actually comes off');
const moodAttacker = engine.freshSave('Surveyor', 'brinember', 92).choir[0];
moodAttacker.level = 24;
moodAttacker.stats = engine.statsAt(engine.species('brinember').baseStats, 24);
const moodFoe = engine.makeInstance(engine.freshSave('Surveyor', 'wynveil', 93), 'draygust', 6);
const openMood = engine.computeDamage(moodAttacker, moodFoe, engine.motif('coal-spiral'), 0.5);
moodAttacker.status = 'Brambled';
const cutMood = engine.computeDamage(moodAttacker, moodFoe, engine.motif('coal-spiral'), 0.5);
assert(cutMood < openMood, 'brambled weakens the phrase');

const recoilSave = engine.freshSave('Surveyor', 'brinember', 94);
armMotif(recoilSave, pulseRecoil.id);
const recoilFoe = engine.makeInstance(recoilSave, 'draygust', 2);
recoilFoe.vigor = 1;
recoilFoe.stats.tempo = 1;
const recoilBattle = engine.createBattle([recoilFoe], 'wild', null);
const full = recoilSave.choir[0].vigor;
const recoilLogs = engine.stepBattle(recoilSave, recoilBattle, { type: 'motif', motifId: pulseRecoil.id });
const recoilLine = recoilLogs.find((line) => line.indexOf('recoil') !== -1);
assert(recoilLine, 'a pulse recoil is logged');
const back = Number(recoilLine.match(/takes (\d+)/)[1]);
assert(back >= 1 && recoilSave.choir[0].vigor === full - back, 'recoil spends the singer vigor');

const guardSave = engine.freshSave('Surveyor', 'brinember', 95);
armMotif(guardSave, guardMotif.id);
const wardHarmonic = guardMotif.harmonic;
const wardBefore = guardSave.choir[0].ward[wardHarmonic];
const guardFoe = engine.makeInstance(guardSave, 'draygust', 2);
guardFoe.vigor = 1;
guardFoe.stats.tempo = 1;
const guardBattle = engine.createBattle([guardFoe], 'wild', null);
const guardLogs = engine.stepBattle(guardSave, guardBattle, { type: 'motif', motifId: guardMotif.id });
assert(guardLogs.some((line) => line.indexOf('Ward against ' + wardHarmonic) !== -1), 'a guard motif names the ward');
assert(guardSave.choir[0].ward[wardHarmonic] < wardBefore, 'the ward multiplier falls as the ward rises');
assert(guardSave.choir[0].ward[wardHarmonic] >= 0.55, 'a ward does not rise without a floor');
const probe = data.MOTIFS.find((m) => m.harmonic === wardHarmonic && m.power >= 48);
const striker = engine.makeInstance(guardSave, 'kalflare', 30);
const bare = {
  speciesId: striker.speciesId,
  level: 30,
  stats: striker.stats,
  status: null
};
const openWard = Object.assign({}, guardSave.choir[0].ward);
openWard[wardHarmonic] = wardBefore;
const takenBefore = engine.computeDamage(bare, Object.assign({}, guardSave.choir[0], { ward: openWard }), probe, 0.5);
const takenAfter = engine.computeDamage(bare, guardSave.choir[0], probe, 0.5);
assert(takenAfter < takenBefore, 'a raised ward takes less of that harmonic');

const dimSave = engine.freshSave('Surveyor', 'brinember', 96);
dimSave.choir[0].status = 'Dimmed';
dimSave.choir[0].statusLeft = 1;
dimSave.choir[0].stats.tempo = 900;
const dimFoe = engine.makeInstance(dimSave, 'veshcrag', 4);
dimFoe.stats.tempo = 1;
dimFoe.vigor = 90;
const dimBattle = engine.createBattle([dimFoe], 'wild', null);
const dimLogs = engine.stepBattle(dimSave, dimBattle, { type: 'motif', motifId: 'hush-ember' });
assert(dimLogs.some((line) => line.indexOf('Dimmed') !== -1), 'dimmed holds the phrase');
assert(dimFoe.vigor === 90, 'a dimmed phrase deals none');
assert(dimSave.choir[0].status === null, 'dimmed ends after its phrases');

let rivenSkips = 0;
let rivenActs = 0;
for (let seed = 1; seed <= 64 && (rivenSkips === 0 || rivenActs === 0); seed++) {
  const rivenSave = engine.freshSave('Surveyor', 'brinember', seed);
  rivenSave.choir[0].status = 'Riven';
  rivenSave.choir[0].stats.tempo = 900;
  const rivenFoe = engine.makeInstance(rivenSave, 'veshcrag', 4);
  rivenFoe.stats.tempo = 1;
  rivenFoe.vigor = 200;
  const rivenBattle = engine.createBattle([rivenFoe], 'wild', null);
  const rivenLogs = engine.stepBattle(rivenSave, rivenBattle, { type: 'motif', motifId: 'hush-ember' });
  if (rivenLogs.some((line) => line.indexOf('phrase breaks') !== -1)) rivenSkips += 1;
  else if (rivenFoe.vigor < 200) rivenActs += 1;
}
assert(rivenSkips > 0 && rivenActs > 0, 'riven sometimes breaks the phrase and sometimes does not');
engine.healChoir(scorchedSave);
assert(scorchedSave.choir[0].status === null, 'the lamp clears a status');

console.log('resonants: ' + data.RESONANTS.length);
console.log('motifs: ' + data.MOTIFS.length);
console.log('assertions passed: ' + passed);
console.log('assertions failed: ' + failed);
console.log('scripted wins: ' + wins + ' losses: ' + losses);
if (failed) process.exit(1);
