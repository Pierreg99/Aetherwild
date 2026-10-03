(function () {
  const A = globalThis.AETHER;
  const E = globalThis.AetherEngine;
  const Art = globalThis.AetherArt;
  const canvas = document.getElementById('view');
  const ctx = canvas.getContext('2d');
  const dock = document.getElementById('dock');
  const logEl = document.getElementById('log');
  const placeEl = document.getElementById('place');

  let screen = 'title';
  let save = null;
  let battle = null;
  let dialogue = null;
  let helpReturn = 'title';
  let createPick = 0;
  let surveyorName = 'Surveyor';
  let submenu = '';
  let overflowInst = null;
  let humKindling = false;
  let indexPick = 0;
  let logLines = [];
  let dockSig = '';
  let facing = { x: 0, y: -1 };
  let lastStep = 0;
  const held = {};
  let now = 0;

  function pushLog(text) {
    if (!text) return;
    logLines.push(text);
    if (logLines.length > 5) logLines.shift();
    logEl.textContent = logLines.join(' ');
  }

  function blip(kind) {
    const audio = globalThis.AetherAudio;
    if (audio && audio[kind]) audio[kind]();
  }

  function playScore(name) {
    const audio = globalThis.AetherAudio;
    if (audio && audio.playScore) audio.playScore(name);
  }

  function encodeRecord(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function decodeRecord(text) {
    const bin = atob(text.trim());
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function persist() {
    try {
      localStorage.setItem(A.SAVE_KEY, JSON.stringify(save));
    } catch (err) {
      pushLog('This browser refused the record.');
    }
  }

  function stashCorrupt(raw) {
    try { localStorage.setItem(A.SAVE_KEY + '.corrupt', raw); } catch (err) { /* keep going */ }
  }

  function readRaw() {
    try { return localStorage.getItem(A.SAVE_KEY); } catch (err) { return null; }
  }

  function loadSave() {
    const raw = readRaw();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const norm = E.normalizeSave(parsed);
      if (!norm) {
        stashCorrupt(raw);
        return { corrupt: true };
      }
      return { save: norm };
    } catch (err) {
      stashCorrupt(raw);
      return { corrupt: true };
    }
  }

  function hasRecord() {
    return !!readRaw();
  }

  function tileAt(zone, x, y) {
    if (!zone || y < 0 || x < 0 || y >= zone.map.length || x >= zone.map[y].length) return '#';
    const ch = zone.map[y][x];
    if (ch === '@') return '.';
    return ch;
  }

  function startNew() {
    const raw = readRaw();
    if (raw) {
      try {
        if (!E.normalizeSave(JSON.parse(raw))) stashCorrupt(raw);
      } catch (err) {
        stashCorrupt(raw);
      }
    }
    const name = (surveyorName || '').trim().slice(0, 16) || 'Surveyor';
    const speciesId = A.FIRST_RESONANCE[createPick];
    const seed = ((Date.now() & 0x7fffffff) ^ 0x9e3779b9) || 1;
    save = E.freshSave(name, speciesId, seed);
    save.grace = 2;
    facing = { x: 0, y: -1 };
    battle = null;
    dialogue = null;
    logLines = [];
    pushLog(A.STRINGS.blurb);
    pushLog('Lamp west. Deep grass north and south. Sanctum in the middle. Gate east.');
    persist();
    screen = 'world';
    dockSig = '';
  }

  function continueGame() {
    const loaded = loadSave();
    if (!loaded) {
      pushLog('No record is stored in this browser.');
      return;
    }
    if (loaded.corrupt) {
      pushLog('The saved record is damaged. It was kept aside. A new survey will not delete that copy.');
      dockSig = '';
      return;
    }
    save = loaded.save;
    save.grace = 1;
    facing = { x: 0, y: -1 };
    battle = null;
    logLines = [];
    pushLog('Record restored for ' + save.surveyor + '.');
    screen = 'world';
    dockSig = '';
  }

  function tryStep(dx, dy) {
    if (screen !== 'world' || !save) return;
    facing = { x: dx, y: dy };
    const zone = A.ZONES[save.zone];
    const nx = save.x + dx;
    const ny = save.y + dy;
    const t = tileAt(zone, nx, ny);
    if (t === '#' || t === '~') return;
    if (t === 'N') { talkKeeper(); return; }
    if (t === 'S') { openSanctum(); return; }
    if (t === 'D' || t === 'B') { openGate(zone, t); return; }
    if (t === 'C') { openChorus(); return; }
    if (t === 'P') { openShop(); return; }
    save.x = nx;
    save.y = ny;
    if (t === 'H') {
      E.healChoir(save);
      pushLog(A.STRINGS.healed);
      persist();
    }
    if (t === 'g') {
      if (save.grace > 0) {
        save.grace -= 1;
      } else if (E.pull(save) < 0.22) {
        startWild(zone);
      }
    }
  }

  function interact() {
    if (screen !== 'world' || !save) return;
    const zone = A.ZONES[save.zone];
    const t = tileAt(zone, save.x + facing.x, save.y + facing.y);
    if (t === 'N') talkKeeper();
    else if (t === 'S') openSanctum();
    else if (t === 'D' || t === 'B') openGate(zone, t);
    else if (t === 'C') openChorus();
    else if (t === 'P') openShop();
    else if (t === 'H') {
      E.healChoir(save);
      pushLog(A.STRINGS.healed);
      persist();
    } else pushLog('Nothing here answers.');
  }

  function talkKeeper() {
    save.flags.keeper = true;
    dialogue = { lines: [A.STRINGS.keeper], index: 0, choices: null, onDone: function () { persist(); } };
    logLines = [];
    pushLog(A.STRINGS.keeper);
    screen = 'dialogue';
    dockSig = '';
  }

  function openGate(zone, dir) {
    const gate = E.mayEnter(save, zone, dir);
    if (!gate.ok) {
      if (gate.reason === 'sanctum') pushLog('The far gate stays shut until this Sanctum is answered.');
      else if (gate.reason === 'chorus') pushLog(A.STRINGS.chorusShut);
      else pushLog(A.STRINGS.pathShut);
      return;
    }
    const dest = gate.dest;
    save.zone = dest;
    const mark = dir === 'D' ? 'e' : 'r';
    const land = E.findSpawn(A.ZONES[dest], mark);
    save.x = land.x;
    save.y = land.y;
    save.grace = 2;
    persist();
    pushLog(A.ZONES[dest].name);
    dockSig = '';
  }


  function startSide(def, kind) {
    const foes = def.team.map(function (slot) {
      return E.makeInstance(save, slot.speciesId, slot.level);
    });
    foes.forEach(function (f) { E.see(save, f.speciesId, false); });
    battle = E.createBattle(foes, kind, def.id, null);
    submenu = '';
    logLines = [];
    pushLog(def.name + ' brings ' + foes.length + ' Resonants.');
    screen = 'battle';
    dockSig = '';
  }

  function openChorus() {
    if (!ensureActive()) { pushLog(A.STRINGS.sanctumNeeds); return; }
    if (save.flags.primeClear) { pushLog(A.STRINGS.endingDone); return; }
    if (save.flags.chorusClear) {
      dialogue = {
        lines: A.PRIME_VOICE.intro.slice(),
        index: 0,
        choices: null,
        onDone: function () { startSide(A.PRIME_VOICE, 'prime'); }
      };
      logLines = [];
      pushLog(dialogue.lines[0]);
      screen = 'dialogue';
      dockSig = '';
      return;
    }
    const step = save.flags.chorusIndex || 0;
    const voice = A.CHORUS[step];
    dialogue = {
      lines: [voice.name + ': ' + voice.intro],
      index: 0,
      choices: null,
      onDone: function () { startSide(voice, 'chorus'); }
    };
    logLines = [];
    pushLog(dialogue.lines[0]);
    screen = 'dialogue';
    dockSig = '';
  }

  function openSanctum() {
    const zone = A.ZONES[save.zone];
    const w = A.WARDENS[zone.wardenId];
    if (!w) { pushLog('This Sanctum has no Warden yet.'); return; }
    if (save.flags.sanctums[w.id]) { pushLog(A.STRINGS.sanctumDone); return; }
    if (!ensureActive()) { pushLog(A.STRINGS.sanctumNeeds); return; }
    dialogue = {
      lines: [w.name + ': ' + w.intro],
      index: 0,
      choices: null,
      onDone: function () { startWarden(w); }
    };
    logLines = [];
    pushLog(dialogue.lines[0]);
    screen = 'dialogue';
    dockSig = '';
  }

  function ensureActive() {
    if (save.choir[save.active] && save.choir[save.active].vigor > 0) return true;
    const live = save.choir.findIndex(function (r) { return r.vigor > 0; });
    if (live < 0) return false;
    save.active = live;
    return true;
  }

  function startWild(zone) {
    if (!ensureActive()) { pushLog(A.STRINGS.sanctumNeeds); return; }
    const id = zone.encounters[Math.floor(E.pull(save) * zone.encounters.length)];
    const span = zone.levelMax - zone.levelMin + 1;
    const level = zone.levelMin + Math.floor(E.pull(save) * span);
    const foe = E.makeInstance(save, id, level);
    E.see(save, id, false);
    battle = E.createBattle([foe], 'wild', null);
    submenu = '';
    humKindling = false;
    logLines = [];
    pushLog(E.displayName(foe) + ' · ' + E.species(id).primary + ' · level ' + level);
    playScore('encounter');
    screen = 'battle';
    dockSig = '';
  }

  function startWarden(w) {
    const foes = w.team.map(function (slot, i) {
      return E.makeInstance(save, slot.speciesId, slot.level);
    });
    foes.forEach(function (f) { E.see(save, f.speciesId, false); });
    battle = E.createBattle(foes, 'warden', w.id, w.rules || null);
    submenu = '';
    logLines = [];
    pushLog(w.sanctum + '. ' + w.name + ' brings ' + foes.length + ' Resonants.');
    if (w.rules && w.rules.lockSwitch) pushLog('Only the forward Resonant may sing.');
    if (w.rules && w.rules.reliefAtHalf) pushLog('A wounded Resonant may withdraw.');
    if (w.rules && w.rules.primaryLock) pushLog('This Sanctum hears only your own Harmonic.');
    if (w.rules && w.rules.phraseLimit) pushLog('Finish within ' + w.rules.phraseLimit + ' phrases.');
    if (w.rules && w.rules.kindlingOnly) pushLog('Only Kindling is heard.');
    if (w.rules && w.rules.rotate) pushLog('After you sing, call a different Resonant.');
    if (w.rules && w.rules.openingSoften) pushLog('The first phrase lands softly.');
    screen = 'battle';
    dockSig = '';
  }

  function absorb(logs) {
    for (let i = 0; i < logs.length; i++) pushLog(logs[i]);
    dockSig = '';
    if (battle && battle.result === 'attuned' && battle.overflow) {
      overflowInst = battle.overflow;
      screen = 'overflow';
    }
    if (battle && battle.result === 'attuned') blip('attune');
  }

  function finishBattle() {
    if (!battle) { screen = 'world'; return; }
    const result = battle.result;
    const kind = battle.kind;
    const wardenId = battle.wardenId;
    battle = null;
    submenu = '';
    overflowInst = null;
    save.grace = 3;
    if (result === 'win' && kind === 'warden' && !save.flags.conductorHeard) {
      E.healChoir(save);
      playScore('sanctum');
      openConductor(A.WARDENS[wardenId] ? A.WARDENS[wardenId].win : A.STRINGS.winSlice);
      return;
    }
    if (result === 'win' && kind === 'warden') {
      E.healChoir(save);
      playScore('sanctum');
      pushLog(A.WARDENS[wardenId] ? A.WARDENS[wardenId].win : A.STRINGS.winSlice);
      save.storyBeat = 'sanctum-cleared';
    }
    if (result === 'win' && kind === 'chorus') {
      E.healChoir(save);
      pushLog(save.flags.chorusClear ? A.STRINGS.chorusDone : A.STRINGS.chorusNext);
    }
    if (result === 'win' && kind === 'prime') {
      E.healChoir(save);
      persist();
      playScore('ending');
      openEnding();
      return;
    }
    if (result === 'loss') {
      pushLog(A.STRINGS.lossSlice);
      E.healChoir(save);
      const spawn = E.findSpawn(A.ZONES[save.zone], '@');
      save.x = spawn.x;
      save.y = spawn.y;
    }
    persist();
    if (!(result === 'win' && kind === 'warden')) blip(result === 'loss' ? 'harm' : 'confirm');
    screen = 'world';
    dockSig = '';
  }


  function openEnding() {
    dialogue = {
      lines: A.STRINGS.ending.slice(),
      index: 0,
      choices: null,
      onDone: function () {
        pushLog(A.PRIME_VOICE.win);
        persist();
      }
    };
    logLines = [];
    pushLog(dialogue.lines[0]);
    screen = 'dialogue';
    dockSig = '';
  }

  function openConductor(afterLine) {
    dialogue = {
      lines: A.STRINGS.conductor.slice(),
      index: 0,
      choices: A.STRINGS.conductorAnswers,
      onChoice: function (choice) {
        save.flags.conductorHeard = true;
        save.storyBeat = 'conductor';
        pushLog(choice.line);
        pushLog(afterLine || A.STRINGS.winSlice);
        dialogue = null;
        persist();
        screen = 'world';
        dockSig = '';
      }
    };
    logLines = [];
    pushLog(dialogue.lines[0]);
    screen = 'dialogue';
    dockSig = '';
  }

  function advanceDialogue() {
    if (!dialogue) return;
    if (dialogue.index < dialogue.lines.length - 1) {
      dialogue.index += 1;
      pushLog(dialogue.lines[dialogue.index]);
      dockSig = '';
      return;
    }
    if (dialogue.choices) return;
    const done = dialogue.onDone;
    dialogue = null;
    dockSig = '';
    if (done) done();
    if (!dialogue && screen === 'dialogue') screen = 'world';
  }

  function openShop() {
    screen = 'shop';
    pushLog(A.SHOPS.yard.name + '. Shards: ' + (save.shards || 0) + '.');
    dockSig = '';
  }

  function moveToReserve(index) {
    const inst = save.choir[index];
    if (!E.storeReserve(save, index)) {
      if (save.choir.length < 2) pushLog('The Choir cannot be empty.');
      else pushLog('The Vault is full.');
      return;
    }
    persist();
    pushLog(E.displayName(inst) + ' waits in the Vault.');
    dockSig = '';
  }

  function onKey(key) {
    if (key === 'Escape') {
      if (screen === 'index' || screen === 'choir' || screen === 'shop') { screen = 'world'; dockSig = ''; return; }
      if (screen === 'help' || screen === 'create') {
        screen = (screen === 'help' && helpReturn === 'world' && save) ? 'world' : 'title';
        dockSig = '';
        return;
      }
      if (screen === 'battle' && submenu === 'switch' && battle && !battle.mustSwitch) {
        submenu = '';
        dockSig = '';
      }
      return;
    }
    if (screen === 'dialogue') {
      if (key === 'Enter' || key === ' ') advanceDialogue();
      return;
    }
    if (screen === 'create') {
      if (key === 'ArrowLeft' || key === 'ArrowUp') {
        createPick = (createPick + A.FIRST_RESONANCE.length - 1) % A.FIRST_RESONANCE.length;
        dockSig = '';
      } else if (key === 'ArrowRight' || key === 'ArrowDown') {
        createPick = (createPick + 1) % A.FIRST_RESONANCE.length;
        dockSig = '';
      } else if (key === 'Enter') startNew();
      return;
    }
    if (screen === 'world') {
      if (key === 'e' || key === 'E' || key === 'Enter') interact();
      if (key === 'i' || key === 'I') { screen = 'index'; indexPick = 0; dockSig = ''; }
      if (key === 'c' || key === 'C') { screen = 'choir'; dockSig = ''; }
      return;
    }
    if (screen === 'battle' && battle && battle.result === 'ongoing' && !battle.attune && !battle.mustSwitch && submenu !== 'switch') {
      const p = save.choir[save.active];
      const n = parseInt(key, 10);
      if (n >= 1 && n <= p.knownMotifs.length) {
        absorb(E.stepBattle(save, battle, { type: 'motif', motifId: p.knownMotifs[n - 1] }));
      } else if (key === 'q' || key === 'Q') {
        absorb(E.stepBattle(save, battle, { type: 'attune-start' }));
      } else if (key === 'f' || key === 'F') {
        absorb(E.stepBattle(save, battle, { type: 'flee' }));
      } else if (key === 's' || key === 'S') {
        submenu = 'switch';
        dockSig = '';
      }
    }
  }

  document.addEventListener('keydown', function (e) {
    held[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) !== -1) e.preventDefault();
    if (e.repeat) return;
    onKey(e.key);
  });
  document.addEventListener('keyup', function (e) { held[e.key] = false; });

  function addButton(parent, label, fn, disabled) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (disabled) b.disabled = true;
    b.addEventListener('click', function () { fn(); });
    parent.appendChild(b);
    return b;
  }

  function grid(columns) {
    const g = document.createElement('div');
    g.className = 'grid';
    g.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
    return g;
  }

  function buildDock() {
    let sig = screen;
    if (screen === 'battle' && battle && save) {
      const p = save.choir[save.active];
      sig = ['b', battle.result, battle.mustSwitch, submenu, battle.attune ? battle.attune.guard + ':' + battle.attune.slots : '', p.vigor, JSON.stringify(p.cadence), battle.foeIndex, humKindling].join('|');
    } else if (screen === 'create') sig = 'create:' + createPick;
    else if (screen === 'dialogue' && dialogue) sig = 'd:' + dialogue.index + ':' + dialogue.lines.length + ':' + (dialogue.choices ? 'c' : '');
    else if (screen === 'title') sig = 'title:' + (hasRecord() ? '1' : '0');
    else if (screen === 'choir' && save) sig = 'choir:' + save.choir.map(function (c) { return c.uid + c.vigor; }).join(',') + ':' + save.reserve.map(function (c) { return c.uid; }).join(',');
    else if (screen === 'shop' && save) sig = 'shop:' + (save.shards || 0) + ':' + save.choir[save.active].vigor;
    else if (screen === 'index') sig = 'index:' + indexPick;
    else if (screen === 'world' && save) sig = 'world:' + save.zone;
    else if (screen === 'help') sig = 'help:' + helpReturn;
    else if (screen === 'overflow') sig = 'over:' + (overflowInst ? overflowInst.uid : '');
    if (sig === dockSig) return;
    dockSig = sig;
    dock.replaceChildren();

    if (screen === 'title') {
      const g = grid(1);
      addButton(g, 'New survey', function () { screen = 'create'; createPick = 0; dockSig = ''; });
      addButton(g, 'Continue', continueGame, !hasRecord());
      addButton(g, 'How to listen', function () { helpReturn = 'title'; screen = 'help'; dockSig = ''; });
      dock.appendChild(g);
      return;
    }

    if (screen === 'help') {
      const g = grid(1);
      addButton(g, 'Back', function () {
        screen = helpReturn === 'world' && save ? 'world' : 'title';
        dockSig = '';
      });
      dock.appendChild(g);
      return;
    }

    if (screen === 'create') {
      const input = document.createElement('input');
      input.maxLength = 16;
      input.value = surveyorName;
      input.setAttribute('aria-label', 'Surveyor name');
      input.placeholder = 'Surveyor name';
      input.addEventListener('input', function () { surveyorName = input.value; });
      dock.appendChild(input);
      const g = grid(1);
      A.FIRST_RESONANCE.forEach(function (id, i) {
        const sp = E.species(id);
        addButton(g, (i === createPick ? 'Chosen: ' : '') + sp.name + ' · ' + sp.primary, function () {
          createPick = i;
          dockSig = '';
        });
      });
      addButton(g, 'Begin survey', startNew);
      addButton(g, 'Back', function () { screen = 'title'; dockSig = ''; });
      dock.appendChild(g);
      return;
    }

    if (screen === 'dialogue' && dialogue) {
      const g = grid(1);
      const atEnd = dialogue.index >= dialogue.lines.length - 1;
      if (!atEnd || !dialogue.choices) addButton(g, 'Continue', advanceDialogue);
      if (atEnd && dialogue.choices) {
        dialogue.choices.forEach(function (choice) {
          addButton(g, choice.label, function () { dialogue.onChoice(choice); });
        });
      }
      dock.appendChild(g);
      return;
    }

    if (screen === 'world') {
      const pad = document.createElement('div');
      pad.className = 'pad';
      const blanks = { 0: true, 2: true, 4: true, 6: true, 8: true };
      const keys = {
        1: ['North', 0, -1],
        3: ['West', -1, 0],
        5: ['East', 1, 0],
        7: ['South', 0, 1]
      };
      for (let i = 0; i < 9; i++) {
        if (keys[i]) {
          addButton(pad, keys[i][0], function () { tryStep(keys[i][1], keys[i][2]); });
        } else {
          const s = document.createElement('span');
          pad.appendChild(s);
        }
      }
      dock.appendChild(pad);
      const g = grid(4);
      addButton(g, 'Speak', interact);
      addButton(g, 'Index', function () { screen = 'index'; indexPick = 0; dockSig = ''; });
      addButton(g, 'Choir', function () { screen = 'choir'; dockSig = ''; });
      addButton(g, 'Record', function () { persist(); pushLog('Record stored in this browser.'); });
      dock.appendChild(g);
      const share = grid(2);
      addButton(share, 'Share record', function () { screen = 'export'; dockSig = ''; });
      addButton(share, 'Read record', function () { screen = 'import'; dockSig = ''; });
      dock.appendChild(share);
      return;
    }

    if (screen === 'export' || screen === 'import') {
      const box = document.createElement('textarea');
      box.setAttribute('aria-label', 'Record text');
      box.rows = 4;
      if (screen === 'export') box.value = encodeRecord(save);
      const g = grid(1);
      if (screen === 'import') {
        addButton(g, 'Apply record', function () {
          try {
            const parsed = decodeRecord(box.value);
            const norm = E.normalizeSave(parsed);
            if (!norm) { pushLog('That record cannot be read.'); return; }
            save = norm;
            save.grace = 2;
            persist();
            pushLog('Record read for ' + save.surveyor + '.');
            screen = 'world';
            dockSig = '';
          } catch (err) {
            pushLog('That record cannot be read.');
          }
        });
      }
      addButton(g, 'Back', function () { screen = 'world'; dockSig = ''; });
      dock.appendChild(box);
      dock.appendChild(g);
      return;
    }

    if (screen === 'index') {
      const g = grid(2);
      A.RESONANTS.forEach(function (sp, i) {
        const rec = save.index[sp.id];
        const unwritten = sp.fromAscension && !(rec && rec.seen);
        const label = unwritten ? 'Unwritten' : (rec && rec.seen ? sp.name : 'Unrecorded');
        addButton(g, label, function () {
          indexPick = i;
          const r = save.index[sp.id];
          if (sp.fromAscension && !(r && r.seen)) { pushLog('That line is still unwritten.'); dockSig = ''; return; }
          if (!r || !r.seen) pushLog('No record yet.');
          else if (!r.attuned) pushLog(sp.name + ' · ' + sp.primary + '. Seen, not attuned. ' + sp.flavor);
          else pushLog(sp.name + ' · ' + sp.primary + '. Attuned. ' + sp.flavor);
          dockSig = '';
        });
      });
      addButton(g, 'Back', function () { screen = 'world'; dockSig = ''; });
      dock.appendChild(g);
      return;
    }

    if (screen === 'choir') {
      const g = grid(1);
      save.choir.forEach(function (inst, i) {
        const sp = E.species(inst.speciesId);
        const mark = i === save.active ? 'Forward: ' : '';
        addButton(g, mark + sp.name + ' Vigor ' + inst.vigor + '/' + inst.stats.vigor + ' L' + inst.level, function () {
          if (inst.vigor <= 0) { pushLog(sp.name + ' has no Vigor.'); return; }
          save.active = i;
          persist();
          pushLog(sp.name + ' is forward.');
          dockSig = '';
        });
        addButton(g, 'Vault ' + sp.name, function () { moveToReserve(i); });
      });
      if (save.reserve.length) {
        save.reserve.forEach(function (inst, seat) {
          const sp = E.species(inst.speciesId);
          addButton(g, 'Swap Vault ' + (seat + 1) + ' ' + sp.name + ' into Choir 1', function () {
            E.swapReserve(save, 0, seat);
            persist();
            pushLog('Vault seat ' + (seat + 1) + ' and the first Choir seat trade places.');
            dockSig = '';
          });
        });
      } else addButton(g, 'Vault empty', function () {}, true);
      addButton(g, 'Back', function () { screen = 'world'; dockSig = ''; });
      dock.appendChild(g);
      return;
    }

    if (screen === 'shop' && save) {
      const g = grid(1);
      addButton(g, 'Shards ' + (save.shards || 0), function () {}, true);
      A.SHOPS.yard.stock.forEach(function (item) {
        addButton(g, item.name + ' · ' + item.cost, function () {
          const res = E.buy(save, item.id);
          if (!res.ok && res.reason === 'purse') pushLog(A.STRINGS.shopPoor);
          else if (!res.ok && res.reason === 'full') pushLog(A.STRINGS.shopFull);
          else if (!res.ok) pushLog('The stall does not have that.');
          else {
            persist();
            pushLog(A.STRINGS.shopBought + ' Shards: ' + save.shards + '.');
          }
          dockSig = '';
        });
      });
      addButton(g, 'Back', function () { screen = 'world'; dockSig = ''; });
      dock.appendChild(g);
      return;
    }

    if (screen === 'overflow' && overflowInst) {
      const g = grid(1);
      pushLogOnce();
      save.choir.forEach(function (inst, i) {
        addButton(g, 'Let ' + E.displayName(inst) + ' go', function () {
          E.releaseFor(save, i, overflowInst);
          overflowInst = null;
          battle = null;
          save.grace = 3;
          persist();
          pushLog('The hum changes seats.');
          screen = 'world';
          dockSig = '';
        });
      });
      save.reserve.forEach(function (inst, seat) {
        addButton(g, 'Let Vault ' + (seat + 1) + ' ' + E.displayName(inst) + ' go', function () {
          E.releaseFor(save, 'vault:' + seat, overflowInst);
          overflowInst = null;
          battle = null;
          save.grace = 3;
          persist();
          pushLog('That Vault seat takes the new hum.');
          screen = 'world';
          dockSig = '';
        });
      });
      dock.appendChild(g);
      return;
    }

    if (screen === 'battle' && battle) {
      const g = grid(2);
      if (battle.result !== 'ongoing') {
        addButton(g, 'Continue', finishBattle);
        dock.appendChild(g);
        return;
      }
      if (battle.mustSwitch || submenu === 'switch') {
        save.choir.forEach(function (inst, i) {
          addButton(g, E.displayName(inst) + ' ' + inst.vigor, function () {
            submenu = '';
            absorb(E.stepBattle(save, battle, { type: 'switch', index: i }));
          }, inst.vigor <= 0);
        });
        if (!battle.mustSwitch) addButton(g, 'Back', function () { submenu = ''; dockSig = ''; });
        dock.appendChild(g);
        return;
      }
      if (battle.attune) {
        ['Low', 'Mid', 'High'].forEach(function (pitch) {
          addButton(g, pitch, function () {
            absorb(E.stepBattle(save, battle, { type: 'hum', pitch: pitch, harmonic: null, kindling: humKindling }));
          });
        });
        A.HARMONICS.forEach(function (h) {
          addButton(g, h, function () {
            absorb(E.stepBattle(save, battle, { type: 'hum', pitch: null, harmonic: h, kindling: humKindling }));
          });
        });
        addButton(g, humKindling ? 'Kindling on' : 'Kindling off', function () {
          humKindling = !humKindling;
          dockSig = '';
        });
        if (battle.attune.slots === 3) {
          addButton(g, 'Lower Censer', function () {
            battle.attune = null;
            pushLog('You lower the Censer.');
            dockSig = '';
          });
        }
        dock.appendChild(g);
        return;
      }
      const p = save.choir[save.active];
      p.knownMotifs.forEach(function (id, idx) {
        const m = E.motif(id);
        const cur = p.cadence[id] || 0;
        addButton(g, (idx + 1) + ' ' + m.name + ' ' + cur, function () {
          absorb(E.stepBattle(save, battle, { type: 'motif', motifId: id }));
        }, cur < m.cadenceCost);
      });
      addButton(g, 'Attune', function () { absorb(E.stepBattle(save, battle, { type: 'attune-start' })); });
      addButton(g, 'Call', function () { submenu = 'switch'; dockSig = ''; });
      addButton(g, 'Leave', function () { absorb(E.stepBattle(save, battle, { type: 'flee' })); });
      dock.appendChild(g);
    }
  }

  let overflowNoted = false;
  function pushLogOnce() {
    if (overflowNoted) return;
    overflowNoted = true;
  }

  function bar(x, y, w, h, ratio) {
    ctx.fillStyle = '#10211c';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = ratio < 0.28 ? '#e07a62' : '#7dcea0';
    ctx.fillRect(x, y, Math.max(0, Math.round(w * Math.max(0, Math.min(1, ratio)))), h);
    ctx.strokeStyle = '#d5e6da';
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  function drawWorld() {
    const zone = A.ZONES[save.zone];
    const T = 16;
    const mapW = zone.map[0].length * T;
    const mapH = zone.map.length * T;
    let camX = Math.floor(save.x * T - canvas.width / 2 + T / 2);
    let camY = Math.floor(save.y * T - canvas.height / 2 + T / 2);
    camX = Math.max(0, Math.min(Math.max(0, mapW - canvas.width), camX));
    camY = Math.max(0, Math.min(Math.max(0, mapH - canvas.height), camY));
    ctx.fillStyle = '#0e1412';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < zone.map.length; y++) {
      for (let x = 0; x < zone.map[y].length; x++) {
        const sx = x * T - camX;
        const sy = y * T - camY;
        if (sx < -T || sy < -T || sx > canvas.width || sy > canvas.height) continue;
        Art.drawTile(ctx, tileAt(zone, x, y), sx, sy, T);
      }
    }
    Art.drawSurveyor(ctx, save.x * T - camX, save.y * T - camY, now);
  }

  function drawBattle() {
    ctx.fillStyle = '#12211c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1c3a30';
    ctx.fillRect(0, 108, canvas.width, 72);
    const foe = E.foe(battle);
    const self = save.choir[save.active];
    if (foe) Art.drawResonant(ctx, E.species(foe.speciesId), 230, 62, 54, now);
    if (self) Art.drawResonant(ctx, E.species(self.speciesId), 78, 100, 48, now + 400);
    ctx.fillStyle = '#e7f2ea';
    ctx.font = '12px ui-monospace, monospace';
    if (foe) {
      const sp = E.species(foe.speciesId);
      ctx.fillText(sp.name + ' ' + sp.primary + ' L' + foe.level, 16, 18);
      bar(16, 24, 120, 8, foe.vigor / foe.stats.vigor);
      ctx.fillText('Vigor ' + foe.vigor + '/' + foe.stats.vigor, 16, 46);
    }
    if (self) {
      const sp = E.species(self.speciesId);
      ctx.fillText(sp.name + ' ' + sp.primary + ' L' + self.level, 150, 124);
      bar(150, 130, 150, 8, self.vigor / self.stats.vigor);
      ctx.fillText('Vigor ' + self.vigor + '/' + self.stats.vigor, 150, 154);
    }
    if (battle.attune) {
      ctx.fillText('Guard ' + battle.attune.guard + ' · Hums ' + battle.attune.slots, 16, 78);
    }
    ctx.fillText('Phrase ' + battle.phrases, 16, 168);
  }

  function drawTitleLike() {
    ctx.fillStyle = '#10211c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ids = screen === 'create' ? A.FIRST_RESONANCE : A.FIRST_RESONANCE;
    ids.forEach(function (id, i) {
      const sp = E.species(id);
      const focus = screen === 'create' && i === createPick;
      Art.drawResonant(ctx, sp, 60 + i * 100, focus ? 78 : 92, focus ? 46 : 32, now + i * 200);
    });
    ctx.fillStyle = '#e6c56e';
    ctx.font = '20px ui-monospace, monospace';
    ctx.fillText('AETHERWILD', 16, 28);
    ctx.fillStyle = '#e7f2ea';
    ctx.font = '12px ui-monospace, monospace';
    if (screen === 'help') {
      wrapText('Walk the yard. Grass starts a wild phrase. Attune with three Hums. The Sanctum waits in the middle. Keys: arrows, E speak, I index, C choir, 1-4 Motifs, Q attune, F leave.', 16, 120, 288, 14);
    } else if (screen === 'create') {
      const sp = E.species(A.FIRST_RESONANCE[createPick]);
      ctx.fillText('First Resonance: ' + sp.name, 16, 150);
    } else {
      wrapText(A.STRINGS.blurb, 16, 128, 288, 14);
    }
  }

  function wrapText(text, x, y, max, line) {
    const words = text.split(' ');
    let row = '';
    for (let i = 0; i < words.length; i++) {
      const trial = row ? row + ' ' + words[i] : words[i];
      if (ctx.measureText(trial).width > max) {
        ctx.fillText(row, x, y);
        y += line;
        row = words[i];
      } else row = trial;
    }
    if (row) ctx.fillText(row, x, y);
  }

  function drawIndex() {
    ctx.fillStyle = '#10211c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const sp = A.RESONANTS[indexPick] || A.RESONANTS[0];
    const rec = save.index[sp.id];
    ctx.fillStyle = '#e6c56e';
    ctx.font = '14px ui-monospace, monospace';
    ctx.fillText('Harmonic Index', 16, 22);
    if (rec && rec.seen) {
      Art.drawResonant(ctx, sp, 70, 100, 50, now);
      ctx.fillStyle = '#e7f2ea';
      ctx.font = '12px ui-monospace, monospace';
      ctx.fillText(sp.name + ' · ' + sp.primary, 130, 70);
      ctx.fillText(rec.attuned ? 'Attuned' : 'Seen', 130, 88);
      const b = sp.baseStats;
      ctx.fillText('Vig ' + b.vigor + ' Foc ' + b.focus + ' Grd ' + b.guard, 130, 112);
      ctx.fillText('Spi ' + b.spirit + ' Edg ' + b.edge + ' Tem ' + b.tempo, 130, 128);
    } else {
      ctx.fillStyle = '#e7f2ea';
      ctx.fillText('Unrecorded', 16, 80);
    }
  }

  function draw() {
    if (screen === 'world' && save) {
      placeEl.textContent = A.ZONES[save.zone].name;
      drawWorld();
    } else if (screen === 'battle' && battle && save) {
      placeEl.textContent = battle.kind === 'warden' ? A.WARDENS[battle.wardenId].sanctum : 'Wild phrase';
      drawBattle();
    } else if ((screen === 'index' || screen === 'choir' || screen === 'overflow' || screen === 'shop') && save) {
      placeEl.textContent = screen === 'index' ? 'Harmonic Index' : (screen === 'shop' ? A.SHOPS.yard.name : 'Choir');
      if (screen === 'index') drawIndex();
      else drawWorld();
    } else {
      placeEl.textContent = 'Lumenfall';
      drawTitleLike();
    }
  }

  function loop(t) {
    now = t;
    if (screen === 'world' && t - lastStep > 150) {
      if (held.ArrowUp || held.w || held.W) { tryStep(0, -1); lastStep = t; }
      else if (held.ArrowDown || held.s || held.S) { tryStep(0, 1); lastStep = t; }
      else if (held.ArrowLeft || held.a || held.A) { tryStep(-1, 0); lastStep = t; }
      else if (held.ArrowRight || held.d || held.D) { tryStep(1, 0); lastStep = t; }
    }
    draw();
    buildDock();
    requestAnimationFrame(loop);
  }

  logLines = [A.STRINGS.blurb];
  logEl.textContent = logLines[0];
  requestAnimationFrame(loop);
})();
