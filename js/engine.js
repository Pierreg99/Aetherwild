(function (root) {
  const AETHER = root.AETHER || (typeof require === 'function' ? require('./data.js') : null);
  if (!AETHER) throw new Error('AETHER data missing');

  function rngNext(seed) {
    let a = seed >>> 0;
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return { value: value, seed: a };
  }

  function pull(save) {
    const n = rngNext(save.rngSeed >>> 0);
    save.rngSeed = n.seed;
    return n.value;
  }

  function species(id) {
    return AETHER.RESONANTS.find(function (r) { return r.id === id; }) || null;
  }

  function motif(id) {
    return AETHER.MOTIFS.find(function (m) { return m.id === id; }) || null;
  }

  function strongAgainst(harmonic) {
    return (AETHER.HARMONIC_STRONG[harmonic] || []).slice();
  }

  function weakAgainst(harmonic) {
    return AETHER.HARMONICS.filter(function (other) {
      return strongAgainst(other).indexOf(harmonic) !== -1;
    });
  }

  function multiplier(from, to) {
    if (strongAgainst(from).indexOf(to) !== -1) return 1.5;
    if (weakAgainst(from).indexOf(to) !== -1) return 0.75;
    return 1;
  }

  function normalizeWard(ward) {
    const out = {};
    for (let i = 0; i < AETHER.HARMONICS.length; i++) {
      const h = AETHER.HARMONICS[i];
      out[h] = ward && typeof ward[h] === 'number' ? ward[h] : 1;
    }
    return out;
  }

  function dominantHarmonic(ward) {
    const w = normalizeWard(ward);
    let best = AETHER.HARMONICS[0];
    let v = -Infinity;
    for (let i = 0; i < AETHER.HARMONICS.length; i++) {
      const h = AETHER.HARMONICS[i];
      if (w[h] > v) { v = w[h]; best = h; }
    }
    return best;
  }

  function statsAt(base, level) {
    function f(key, extra) {
      return Math.max(1, Math.floor(base[key] * level / 28) + extra);
    }
    return {
      vigor: Math.max(10, Math.floor(base.vigor * level / 22) + 12),
      focus: f('focus', 5),
      guard: f('guard', 5),
      spirit: f('spirit', 5),
      edge: f('edge', 5),
      tempo: f('tempo', 5)
    };
  }

  function takeUid(save) {
    save.nextUid = save.nextUid || 1;
    const id = 'u' + save.nextUid;
    save.nextUid += 1;
    return id;
  }

  function makeInstance(save, speciesId, level) {
    const sp = species(speciesId);
    const stats = statsAt(sp.baseStats, level);
    const cadence = {};
    for (let i = 0; i < sp.learnset.length; i++) {
      const id = sp.learnset[i];
      cadence[id] = motif(id).cadenceMax;
    }
    return {
      uid: takeUid(save),
      speciesId: speciesId,
      level: level,
      stats: stats,
      vigor: stats.vigor,
      ward: normalizeWard(sp.baseWard),
      cadence: cadence,
      knownMotifs: sp.learnset.slice(),
      resonance: 70,
      experience: 0,
      status: null,
      battleStats: emptyBattleStats(70)
    };
  }

  function findSpawn(zone, mark) {
    const map = zone.map;
    for (let y = 0; y < map.length; y++) {
      const x = map[y].indexOf(mark);
      if (x !== -1) return { x: x, y: y };
    }
    return { x: 1, y: 1 };
  }

  function freshSave(name, speciesId, seed) {
    const zone = AETHER.ZONES.yard;
    const spawn = findSpawn(zone, '@');
    const save = {
      version: AETHER.SAVE_VERSION,
      surveyor: name || 'Surveyor',
      zone: 'yard',
      x: spawn.x,
      y: spawn.y,
      active: 0,
      choir: [],
      reserve: [],
      shards: 0,
      index: {},
      flags: { sanctums: {}, conductorHeard: false, wins: 0, losses: 0, keeper: false },
      storyBeat: 'yard',
      rngSeed: (seed >>> 0) || 1,
      nextUid: 1
    };
    const inst = makeInstance(save, speciesId, 6);
    inst.resonance = 70;
    save.choir.push(inst);
    see(save, speciesId, true);
    return save;
  }

  function see(save, speciesId, attuned) {
    const prev = save.index[speciesId] || { seen: false, attuned: false };
    save.index[speciesId] = { seen: true, attuned: prev.attuned || !!attuned };
  }

  function emptyBattleStats(resonance) {
    return {
      motifUses: {},
      winsByHarmonic: {},
      biomes: {},
      bondPeak: resonance || 0,
      fainted: false
    };
  }

  function ensureBattleStats(inst) {
    if (!inst.battleStats) inst.battleStats = emptyBattleStats(inst.resonance || 0);
    inst.battleStats.motifUses = inst.battleStats.motifUses || {};
    inst.battleStats.winsByHarmonic = inst.battleStats.winsByHarmonic || {};
    inst.battleStats.biomes = inst.battleStats.biomes || {};
    if (typeof inst.battleStats.bondPeak !== 'number') inst.battleStats.bondPeak = inst.resonance || 0;
    if (typeof inst.battleStats.fainted !== 'boolean') inst.battleStats.fainted = false;
    return inst.battleStats;
  }

  function displayName(inst) {
    const sp = species(inst.speciesId);
    return sp ? sp.name : 'Resonant';
  }

  function experienceToAdvance(level) {
    return (level + 1) * (level + 1) * 6;
  }

  function grantResonance(save, foe) {
    const sp = species(foe.speciesId);
    const factor = { common: 1, uncommon: 1.15, rare: 1.3, mythic: 1.5 }[sp.rarity] || 1;
    const gain = Math.floor((6 * foe.level * foe.level) / 7 * factor);
    const inst = save.choir[save.active];
    if (!inst || inst.vigor <= 0) return gain;
    inst.experience += Math.max(1, gain);
    save.shards = (save.shards || 0) + Math.max(1, Math.floor((foe.level || 1) / 2));
    inst.resonance = Math.min(255, inst.resonance + 8);
    const bs = ensureBattleStats(inst);
    bs.bondPeak = Math.max(bs.bondPeak, inst.resonance);
    const primary = species(inst.speciesId).primary;
    bs.winsByHarmonic[primary] = (bs.winsByHarmonic[primary] || 0) + 1;
    if (save.zone) bs.biomes[save.zone] = true;
    let notes = 0;
    if (inst.level > AETHER.LEVEL_CAP) inst.level = AETHER.LEVEL_CAP;
    while (inst.level < AETHER.LEVEL_CAP && inst.experience >= experienceToAdvance(inst.level)) {
      inst.experience -= experienceToAdvance(inst.level);
      inst.level += 1;
      const ratio = inst.stats.vigor > 0 ? inst.vigor / inst.stats.vigor : 0;
      inst.stats = statsAt(sp.baseStats ? species(inst.speciesId).baseStats : sp.baseStats, inst.level);
      inst.vigor = Math.max(1, Math.round(inst.stats.vigor * ratio));
      notes += 1;
    }
    return { gain: gain, levels: notes, inst: inst };
  }

  function evaluateAscension(inst) {
    if (!inst) return null;
    const sp = species(inst.speciesId);
    const rule = sp && sp.ascension;
    if (!rule) return null;
    if (inst.level < rule.minLevel || inst.resonance < rule.minResonance) return null;
    const bs = ensureBattleStats(inst);
    const c = rule.condition || { kind: 'bond_peak', resonance: rule.minResonance };
    if (c.kind === 'bond_peak' && bs.bondPeak < c.resonance) return null;
    if (c.kind === 'no_faint' && bs.fainted) return null;
    if (c.kind === 'motif_category' && (bs.motifUses[c.cls] || 0) < c.uses) return null;
    if (c.kind === 'harmonic_affinity' && (bs.winsByHarmonic[c.harmonic] || 0) < c.wins) return null;
    if (c.kind === 'biome' && !bs.biomes[c.biomeId]) return null;
    if (!species(rule.to)) return null;
    return rule;
  }

  function tryAscend(save, inst, logs) {
    const rule = evaluateAscension(inst);
    if (!rule || !inst || inst.vigor <= 0) return false;
    const prev = displayName(inst);
    const next = species(rule.to);
    const ratio = inst.stats.vigor > 0 ? inst.vigor / inst.stats.vigor : 1;
    inst.speciesId = next.id;
    inst.stats = statsAt(next.baseStats, inst.level);
    inst.vigor = Math.max(1, Math.min(inst.stats.vigor, Math.round(inst.stats.vigor * ratio)));
    inst.knownMotifs = next.learnset.slice();
    inst.cadence = {};
    for (let i = 0; i < inst.knownMotifs.length; i++) {
      inst.cadence[inst.knownMotifs[i]] = motif(inst.knownMotifs[i]).cadenceMax;
    }
    inst.ward = normalizeWard(next.baseWard);
    see(save, next.id, true);
    if (logs) logs.push(prev + ' ascends into ' + next.name + '.');
    return true;
  }

  function computeDamage(atk, def, m, roll) {
    if (!m || !m.power) return 0;
    const atkSp = species(atk.speciesId);
    const defSp = species(def.speciesId);
    const harmonicClass = AETHER.HARMONICS.indexOf(m.cls) !== -1;
    const atkStat = harmonicClass ? atk.stats.spirit : atk.stats.focus;
    const defStat = Math.max(1, harmonicClass ? def.stats.edge : def.stats.guard);
    const raw = Math.floor((((2 * atk.level) / 5 + 2) * m.power * atkStat) / defStat);
    const base = raw / 50 + 2;
    const stab = m.harmonic === atkSp.primary || m.harmonic === atkSp.secondary ? 1.25 : 1;
    // Section 1.4: ward[h] is damage taken from Harmonic h. Defender ward, not attacker.
    const ward = normalizeWard(def.ward)[m.harmonic];
    const global = multiplier(m.harmonic, defSp.primary);
    const vary = 0.85 + roll * 0.15;
    const crit = roll < 0.0625 ? 1.5 : 1;
    const mood = (atk.status === 'Scorched' || atk.status === 'Brambled') ? 0.75 : 1;
    return Math.max(1, Math.floor(base * stab * ward * global * vary * crit * mood));
  }

  function initialGuard(sp, level) {
    const rarity = { common: 10, uncommon: 22, rare: 34, mythic: 48 }[sp.rarity] || 10;
    const wards = AETHER.HARMONICS.map(function (h) { return sp.baseWard[h]; });
    const spread = Math.max.apply(null, wards) - Math.min.apply(null, wards);
    return Math.round(28 + level * 6 + rarity + spread * 20);
  }

  function resolveHum(sp, hum, guard) {
    const dom = dominantHarmonic(sp.baseWard);
    let delta = 15;
    let note = 'The Hum is wrong. Guard rises.';
    if (hum.harmonic && hum.harmonic === dom) {
      delta = -45;
      note = 'The Hum matches the Ward spike. Guard cracks.';
    } else if (hum.pitch && hum.pitch === sp.pitch) {
      delta = -25;
      note = 'The pitch class rings true. Guard thins.';
    }
    if (hum.kindling) {
      delta -= 10;
      note += ' A Kindling Motif loosens it further.';
    }
    return { guard: Math.max(0, guard + delta), delta: delta, note: note, dominant: dom };
  }

  function restore(inst) {
    inst.vigor = inst.stats.vigor;
    inst.status = null;
    inst.statusLeft = 0;
    for (let i = 0; i < inst.knownMotifs.length; i++) {
      const id = inst.knownMotifs[i];
      inst.cadence[id] = motif(id).cadenceMax;
    }
  }

  function vaultList(save) {
    if (!Array.isArray(save.reserve)) save.reserve = save.reserve ? [save.reserve] : [];
    if (save.reserve.length > AETHER.VAULT_SEATS) save.reserve.length = AETHER.VAULT_SEATS;
    return save.reserve;
  }

  function healChoir(save) {
    const vault = vaultList(save);
    for (let i = 0; i < save.choir.length; i++) restore(save.choir[i]);
    for (let i = 0; i < vault.length; i++) restore(vault[i]);
  }

  function livingIndexes(save) {
    const out = [];
    for (let i = 0; i < save.choir.length; i++) if (save.choir[i].vigor > 0) out.push(i);
    return out;
  }

  function createBattle(foes, kind, wardenId, rules) {
    return {
      kind: kind,
      wardenId: wardenId || null,
      rules: rules || null,
      foeTeam: foes,
      foeIndex: 0,
      result: 'ongoing',
      mustSwitch: false,
      attune: null,
      placed: null,
      phrases: 0,
      log: [kind === 'warden' ? 'The Sanctum answers.' : 'A wild Resonant holds the grass.']
    };
  }

  function foe(battle) { return battle.foeTeam[battle.foeIndex]; }
  function active(save) { return save.choir[save.active]; }

  function spend(inst, motifId) {
    const m = motif(motifId);
    if (!m || (inst.cadence[motifId] || 0) < m.cadenceCost) return false;
    inst.cadence[motifId] -= m.cadenceCost;
    return true;
  }

  function chooseFoeMotif(foeInst, playerInst) {
    let best = null;
    let score = -1;
    for (let i = 0; i < foeInst.knownMotifs.length; i++) {
      const id = foeInst.knownMotifs[i];
      const m = motif(id);
      if ((foeInst.cadence[id] || 0) < m.cadenceCost) continue;
      const s = m.power * multiplier(m.harmonic, species(playerInst.speciesId).primary);
      if (s > score) { score = s; best = id; }
    }
    return best;
  }

  function heldPhrase(save, attacker, logs) {
    if (attacker.status === 'Dimmed') {
      logs.push(displayName(attacker) + ' is Dimmed and holds the phrase.');
      attacker.statusLeft = (attacker.statusLeft || 1) - 1;
      if (attacker.statusLeft <= 0) attacker.status = null;
      return true;
    }
    if (attacker.status === 'Riven' && pull(save) < 0.25) {
      logs.push(displayName(attacker) + ' is Riven and the phrase breaks.');
      return true;
    }
    return false;
  }

  function applyMotifEffect(attacker, defender, m, dmg, logs) {
    const effect = m.effect;
    if (!effect) return;
    if (m.cls === 'Pulse' && effect.kind === 'status') {
      defender.status = effect.status;
      defender.statusLeft = effect.status === 'Dimmed' ? 2 : 0;
      logs.push(displayName(defender) + ' is ' + effect.status + '.');
    } else if (m.cls === 'Pulse' && effect.kind === 'recoil') {
      const back = Math.max(1, Math.floor(dmg * (effect.ratio || 0.25)));
      attacker.vigor = Math.max(0, attacker.vigor - back);
      logs.push(displayName(attacker) + ' takes ' + back + ' Vigor in recoil.');
    } else if (m.cls === 'Guard' && effect.kind === 'ward') {
      const h = m.harmonic;
      const ward = normalizeWard(attacker.ward);
      const next = Math.max(0.55, Math.round((ward[h] + (effect.delta || -0.12)) * 100) / 100);
      ward[h] = next;
      attacker.ward = ward;
      logs.push('Ward against ' + h + ' rises.');
    }
  }

  function tickStatus(inst, logs) {
    if (!inst || inst.vigor <= 0) return;
    if (inst.status !== 'Scorched' && inst.status !== 'Brambled') return;
    const chip = Math.max(1, Math.floor(inst.stats.vigor / 16));
    inst.vigor = Math.max(0, inst.vigor - chip);
    logs.push(displayName(inst) + ' is ' + inst.status + ' and loses ' + chip + ' Vigor.');
  }

  function strike(save, attacker, defender, motifId, logs, scale) {
    const m = motif(motifId);
    if (heldPhrase(save, attacker, logs)) return;
    if (!spend(attacker, motifId)) {
      logs.push(displayName(attacker) + ' has no Cadence for ' + (m ? m.name : 'that Motif') + '.');
      return;
    }
    if (attacker.battleStats) {
      const bs = ensureBattleStats(attacker);
      bs.motifUses[m.cls] = (bs.motifUses[m.cls] || 0) + 1;
    }
    const acc = pull(save);
    if (acc > m.accuracy / 100) {
      logs.push(displayName(attacker) + ' plays ' + m.name + ', and it slips wide.');
      return;
    }
    const roll = pull(save);
    let dmg = computeDamage(attacker, defender, m, roll);
    if (scale && scale !== 1) dmg = Math.max(1, Math.floor(dmg * scale));
    defender.vigor = Math.max(0, defender.vigor - dmg);
    const felt = multiplier(m.harmonic, species(defender.speciesId).primary) * normalizeWard(defender.ward)[m.harmonic];
    let line = displayName(attacker) + ' plays ' + m.name + '. ' + displayName(defender) + ' loses ' + dmg + ' Vigor.';
    if (felt >= 1.45) line += ' The Harmonic rings hard.';
    else if (felt <= 0.85) line += ' The Harmonic comes apart.';
    if (roll < 0.0625) line += ' A bright phrase.';
    logs.push(line);
    if (defender.vigor > 0 || dmg >= 0) applyMotifEffect(attacker, defender, m, dmg, logs);
  }

  function onFoeDown(save, battle, logs) {
    logs.push(displayName(foe(battle)) + ' goes quiet.');
    if (battle.kind === 'wild' || battle.kind === 'warden' || battle.kind === 'chorus' || battle.kind === 'prime') {
      const gained = grantResonance(save, foe(battle));
      if (gained && gained.levels) logs.push(displayName(active(save)) + ' deepens. Choir level ' + active(save).level + '.');
      if (gained && gained.inst) tryAscend(save, gained.inst, logs);
    }
    if (battle.foeIndex < battle.foeTeam.length - 1) {
      battle.foeIndex += 1;
      battle.entered = true;
      logs.push(displayName(foe(battle)) + ' answers the phrase.');
    } else {
      battle.result = 'win';
      save.flags.wins += 1;
      if (battle.kind === 'warden') {
        save.flags.sanctums[battle.wardenId] = true;
        save.storyBeat = 'sanctum-cleared';
        logs.push('The Warden has no further Resonant.');
      } else if (battle.kind === 'chorus') {
        const total = AETHER.CHORUS.length;
        save.flags.chorusIndex = (save.flags.chorusIndex || 0) + 1;
        if (save.flags.chorusIndex >= total) {
          save.flags.chorusClear = true;
          save.storyBeat = 'chorus';
          logs.push('The Chorus is answered. The Prime Voice is still in the hall.');
        } else {
          logs.push('That voice goes quiet. Another waits.');
        }
      } else if (battle.kind === 'prime') {
        save.flags.primeClear = true;
        save.storyBeat = 'prime';
        logs.push('The Prime Voice goes quiet. The hall keeps the song.');
      } else {
        logs.push('The grass is quiet again.');
      }
    }
  }

  function maybeRelief(battle, target, logs) {
    if (!battle.rules || !battle.rules.reliefAtHalf) return;
    if (!target || target.vigor <= 0 || target.vigor * 2 >= target.stats.vigor) return;
    if (battle.foeIndex >= battle.foeTeam.length - 1) return;
    battle.halfSpent = battle.halfSpent || {};
    if (battle.halfSpent[battle.foeIndex]) return;
    battle.halfSpent[battle.foeIndex] = true;
    logs.push(displayName(target) + ' withdraws while it can still sing.');
    battle.foeIndex += 1;
    battle.entered = true;
    logs.push(displayName(foe(battle)) + ' answers the phrase.');
  }

  function onPlayerDown(save, battle, logs) {
    logs.push(displayName(active(save)) + ' can no longer hold a phrase.');
    ensureBattleStats(active(save)).fainted = true;
    if (battle.rules && battle.rules.lockSwitch) {
      battle.result = 'loss';
      save.flags.losses += 1;
      logs.push('The Sanctum keeps the rest of the Choir back.');
      return;
    }
    if (livingIndexes(save).length === 0) {
      battle.result = 'loss';
      save.flags.losses += 1;
      logs.push('Your Choir falls silent.');
    } else {
      battle.mustSwitch = true;
      logs.push('Call another Resonant.');
    }
  }

  function foeActs(save, battle, logs) {
    const f = foe(battle);
    const p = active(save);
    if (!f || f.vigor <= 0 || !p || p.vigor <= 0) return;
    const id = chooseFoeMotif(f, p);
    if (!id) {
      logs.push(displayName(f) + ' holds the phrase.');
      return;
    }
    strike(save, f, p, id, logs);
    if (p.vigor <= 0) onPlayerDown(save, battle, logs);
  }

  function placeAttuned(save, inst) {
    see(save, inst.speciesId, true);
    if (save.choir.length < AETHER.CHOIR_MAX) {
      save.choir.push(inst);
      return 'choir';
    }
    const vault = vaultList(save);
    if (vault.length < AETHER.VAULT_SEATS) {
      vault.push(inst);
      return 'reserve';
    }
    return 'overflow';
  }

  function stepBattle(save, battle, action) {
    const logs = [];
    if (!battle || battle.result !== 'ongoing') return logs;

    if (battle.mustSwitch) {
      if (!action || action.type !== 'switch') {
        logs.push('Call another Resonant.');
        return logs;
      }
      if (battle.rules && battle.rules.rotate && action.index === battle.rotateFrom) {
        logs.push('This Sanctum wants a different voice.');
        return logs;
      }
      if (!switchTo(save, action.index, logs)) return logs;
      battle.mustSwitch = false;
      battle.rotateFrom = null;
      return logs;
    }

    if (battle.attune) {
      if (!action || action.type !== 'hum') {
        logs.push('Choose a Hum.');
        return logs;
      }
      const sp = species(foe(battle).speciesId);
      const res = resolveHum(sp, action, battle.attune.guard);
      battle.attune.guard = res.guard;
      battle.attune.slots -= 1;
      logs.push(res.note + ' Guard is ' + res.guard + '.');
      if (res.guard <= 0) {
        const wild = foe(battle);
        const inst = makeInstance(save, wild.speciesId, wild.level);
        inst.resonance = 70;
        inst.ward = normalizeWard(wild.ward);
        const where = placeAttuned(save, inst);
        battle.placed = where;
        battle.overflow = where === 'overflow' ? inst : null;
        battle.result = 'attuned';
        logs.push(displayName(inst) + ' attunes and is recorded in the Harmonic Index.');
        if (where === 'choir') logs.push('It joins your Choir.');
        if (where === 'reserve') logs.push('The Choir is full. It waits in the Vault.');
        if (where === 'overflow') logs.push('Choir and Vault are full. Choose who lets the hum go.');
      } else if (battle.attune.slots <= 0) {
        battle.result = 'fled';
        logs.push('Guard holds. The Resonant leaves.');
      }
      return logs;
    }

    if (!action) return logs;

    if (action.type === 'switch') {
      if (battle.rules && battle.rules.lockSwitch) {
        logs.push('This Sanctum will not hear a call.');
        return logs;
      }
      const before = save.active;
      if (!switchTo(save, action.index, logs)) return logs;
      if (save.active !== before && foe(battle).vigor > 0) foeActs(save, battle, logs);
      return logs;
    }

    if (action.type === 'flee') {
      if (battle.kind !== 'wild') {
        logs.push('You cannot leave a Sanctum phrase.');
        return logs;
      }
      const chance = Math.max(0.2, Math.min(0.85, 0.45 + (active(save).stats.tempo - foe(battle).stats.tempo) / 250));
      if (pull(save) < chance) {
        battle.result = 'fled';
        logs.push('You leave the phrase unfinished.');
      } else {
        logs.push('The Resonant stays close.');
        foeActs(save, battle, logs);
      }
      return logs;
    }

    if (action.type === 'attune-start') {
      if (battle.kind !== 'wild') {
        logs.push('A Warden does not attune.');
        return logs;
      }
      const p = active(save);
      if (p.vigor / p.stats.vigor < 0.25) {
        battle.result = 'fled';
        logs.push('Your Vigor is too thin. The wild Resonant slips the chord.');
        return logs;
      }
      const sp = species(foe(battle).speciesId);
      const g = initialGuard(sp, foe(battle).level);
      battle.attune = { guard: g, max: g, slots: 3 };
      logs.push('Attunement opens. Guard is ' + g + '. Three Hums remain.');
      return logs;
    }

    if (action.type === 'motif') {
      const m = motif(action.motifId);
      const p = active(save);
      if (!m || p.knownMotifs.indexOf(action.motifId) === -1) {
        logs.push('That Motif is not known.');
        return logs;
      }
      if ((p.cadence[action.motifId] || 0) < m.cadenceCost) {
        logs.push('Not enough Cadence.');
        return logs;
      }
      battle.phrases += 1;
      battle.entered = false;
      tickStatus(p, logs);
      tickStatus(foe(battle), logs);
      if (p.vigor <= 0) onPlayerDown(save, battle, logs);
      if (battle.result === 'ongoing' && foe(battle).vigor <= 0) onFoeDown(save, battle, logs);
      if (battle.result !== 'ongoing') return logs;
      const f = foe(battle);
      const pFirst = p.stats.tempo > f.stats.tempo || (p.stats.tempo === f.stats.tempo && pull(save) < 0.5);
      const order = pFirst ? ['player', 'foe'] : ['foe', 'player'];
      for (let i = 0; i < order.length; i++) {
        if (battle.result !== 'ongoing') break;
        if (order[i] === 'player') {
          if (p.vigor <= 0) continue;
          const target = foe(battle);
          if (battle.rules && battle.rules.kindlingOnly && m.cls !== 'Kindling') {
            spend(p, action.motifId);
            logs.push('This Sanctum hears only Kindling.');
          } else if (battle.rules && battle.rules.primaryLock && m.harmonic !== species(p.speciesId).primary) {
            spend(p, action.motifId);
            logs.push('The Sanctum refuses ' + m.name + '.');
          } else {
            const scale = battle.rules && battle.rules.openingSoften && battle.phrases === 1 ? 0.5 : 1;
            strike(save, p, target, action.motifId, logs, scale);
            if (target.vigor <= 0) onFoeDown(save, battle, logs);
            else maybeRelief(battle, target, logs);
          }
        } else if (!battle.entered && foe(battle).vigor > 0 && p.vigor > 0) {
          foeActs(save, battle, logs);
        }
      }
      battle.entered = false;
      if (battle.result === 'ongoing' && battle.rules && battle.rules.rotate && livingIndexes(save).length > 1) {
        battle.mustSwitch = true;
        battle.rotateFrom = save.active;
        logs.push('The Sanctum asks for another voice.');
      }
      if (battle.result === 'ongoing' && battle.rules && battle.rules.phraseLimit && battle.phrases >= battle.rules.phraseLimit) {
        battle.result = 'loss';
        save.flags.losses += 1;
        logs.push('The Sanctum closes. The phrase was too long.');
      }
      if (battle.result === 'ongoing' && battle.phrases >= 200) {
        const p = active(save);
        const f = foe(battle);
        const pr = p.stats.vigor ? p.vigor / p.stats.vigor : 0;
        const fr = f && f.stats.vigor ? f.vigor / f.stats.vigor : 0;
        battle.result = pr >= fr ? 'win' : 'loss';
        if (battle.result === 'win') {
          save.flags.wins += 1;
          if (battle.kind === 'warden' && battle.wardenId) save.flags.sanctums[battle.wardenId] = true;
        } else save.flags.losses += 1;
        logs.push('The phrase runs out. The stronger Vigor remains.');
      }
      return logs;
    }

    logs.push('The phrase does not answer that.');
    return logs;
  }

  function switchTo(save, index, logs) {
    if (index < 0 || index >= save.choir.length) {
      logs.push('No Resonant stands there.');
      return false;
    }
    if (save.choir[index].vigor <= 0) {
      logs.push(displayName(save.choir[index]) + ' has no Vigor.');
      return false;
    }
    if (index === save.active && active(save).vigor > 0) {
      logs.push(displayName(active(save)) + ' is already forward.');
      return false;
    }
    save.active = index;
    logs.push(displayName(save.choir[index]) + ' comes forward.');
    return true;
  }

  function swapReserve(save, choirIndex, vaultIndex) {
    const vault = vaultList(save);
    const seat = vaultIndex || 0;
    if (choirIndex < 0 || choirIndex >= save.choir.length || !vault[seat]) return false;
    const next = vault[seat];
    vault[seat] = save.choir[choirIndex];
    save.choir[choirIndex] = next;
    if (save.choir[save.active].vigor <= 0) {
      const live = livingIndexes(save);
      if (live.length) save.active = live[0];
    }
    return true;
  }

  function releaseFor(save, slot, inst) {
    const vault = vaultList(save);
    if (slot === 'reserve') {
      if (!vault.length) vault.push(inst);
      else vault[0] = inst;
      return true;
    }
    if (typeof slot === 'string' && slot.indexOf('vault:') === 0) {
      const seat = Number(slot.slice(6));
      if (!isFinite(seat) || seat < 0 || seat >= vault.length) return false;
      vault[seat] = inst;
      return true;
    }
    const index = slot;
    if (index < 0 || index >= save.choir.length) return false;
    save.choir[index] = inst;
    if (save.choir[index].vigor <= 0) save.choir[index].vigor = save.choir[index].stats.vigor;
    return true;
  }


  function storeReserve(save, choirIndex) {
    const vault = vaultList(save);
    if (choirIndex < 0 || choirIndex >= save.choir.length) return false;
    if (save.choir.length < 2) return false;
    if (vault.length >= AETHER.VAULT_SEATS) return false;
    const inst = save.choir.splice(choirIndex, 1)[0];
    vault.push(inst);
    if (save.active >= save.choir.length) save.active = save.choir.length - 1;
    if (save.choir[save.active] && save.choir[save.active].vigor <= 0) {
      const live = livingIndexes(save);
      if (live.length) save.active = live[0];
    }
    return true;
  }

  function buy(save, itemId) {
    const shop = AETHER.SHOPS && AETHER.SHOPS.yard;
    if (!shop) return { ok: false, reason: 'missing' };
    let item = null;
    for (let i = 0; i < shop.stock.length; i++) if (shop.stock[i].id === itemId) item = shop.stock[i];
    if (!item) return { ok: false, reason: 'missing' };
    const purse = save.shards || 0;
    if (purse < item.cost) return { ok: false, reason: 'purse' };
    const inst = active(save);
    if (!inst) return { ok: false, reason: 'choir' };
    if (item.effect === 'vigor') {
      if (inst.vigor >= inst.stats.vigor) return { ok: false, reason: 'full' };
      inst.vigor = inst.stats.vigor;
    } else if (item.effect === 'cadence') {
      let spent = false;
      for (let i = 0; i < inst.knownMotifs.length; i++) {
        const id = inst.knownMotifs[i];
        const max = motif(id).cadenceMax;
        if ((inst.cadence[id] || 0) < max) spent = true;
        inst.cadence[id] = max;
      }
      if (!spent) return { ok: false, reason: 'full' };
    } else return { ok: false, reason: 'missing' };
    save.shards = purse - item.cost;
    return { ok: true, item: item };
  }

  function mayEnter(save, zone, dir) {
    const dest = zone && zone.links ? zone.links[dir] : null;
    if (!dest || !AETHER.ZONES[dest]) return { ok: false, reason: 'shut' };
    if (dir === 'D' && zone.wardenId && !(save.flags.sanctums && save.flags.sanctums[zone.wardenId])) {
      return { ok: false, reason: 'sanctum' };
    }
    const next = AETHER.ZONES[dest];
    if (next && next.requiresChoir) {
      const ids = Object.keys(AETHER.WARDENS);
      for (let i = 0; i < ids.length; i++) {
        if (!save.flags.sanctums || !save.flags.sanctums[ids[i]]) return { ok: false, reason: 'chorus' };
      }
    }
    return { ok: true, dest: dest };
  }

  function normalizeSave(save) {
    if (!save || save.version !== AETHER.SAVE_VERSION) return null;
    for (let i = 0; i < AETHER.SAVE_SCHEMA_KEYS.length; i++) {
      if (!(AETHER.SAVE_SCHEMA_KEYS[i] in save)) return null;
    }
    save.nextUid = save.nextUid || 1;
    save.flags.sanctums = save.flags.sanctums || {};
    for (let i = 0; i < save.choir.length; i++) save.choir[i].ward = normalizeWard(save.choir[i].ward);
    const vault = vaultList(save);
    if (typeof save.shards !== 'number' || save.shards < 0 || !isFinite(save.shards)) save.shards = 0;
    save.shards = Math.floor(save.shards);
    for (let i = 0; i < vault.length; i++) vault[i].ward = normalizeWard(vault[i].ward);
    for (let i = 0; i < save.choir.length; i++) ensureBattleStats(save.choir[i]);
    for (let i = 0; i < vault.length; i++) ensureBattleStats(vault[i]);
    return save;
  }

  const api = {
    rngNext: rngNext,
    pull: pull,
    species: species,
    motif: motif,
    strongAgainst: strongAgainst,
    weakAgainst: weakAgainst,
    multiplier: multiplier,
    normalizeWard: normalizeWard,
    dominantHarmonic: dominantHarmonic,
    statsAt: statsAt,
    makeInstance: makeInstance,
    freshSave: freshSave,
    see: see,
    displayName: displayName,
    experienceToAdvance: experienceToAdvance,
    computeDamage: computeDamage,
    initialGuard: initialGuard,
    resolveHum: resolveHum,
    healChoir: healChoir,
    createBattle: createBattle,
    stepBattle: stepBattle,
    placeAttuned: placeAttuned,
    swapReserve: swapReserve,
    storeReserve: storeReserve,
    releaseFor: releaseFor,
    grantResonance: grantResonance,
    buy: buy,
    normalizeSave: normalizeSave,
    evaluateAscension: evaluateAscension,
    tryAscend: tryAscend,
    active: active,
    foe: foe,
    findSpawn: findSpawn,
    mayEnter: mayEnter
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AetherEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
