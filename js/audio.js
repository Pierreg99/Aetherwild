(function (root) {
  // Original interval rows written for this survey. Not a quoted melody.
  const PHRASES = {
    encounter: [
      { freq: 311, dur: 0.22 },
      { freq: 369, dur: 0.18 },
      { freq: 330, dur: 0.2 },
      { freq: 415, dur: 0.28 },
      { freq: 277, dur: 0.42 }
    ],
    sanctum: [
      { freq: 247, dur: 0.28 },
      { freq: 294, dur: 0.24 },
      { freq: 330, dur: 0.24 },
      { freq: 370, dur: 0.28 },
      { freq: 415, dur: 0.32 },
      { freq: 330, dur: 0.22 },
      { freq: 494, dur: 0.56 }
    ],
    ending: [
      { freq: 196, dur: 0.34 },
      { freq: 233, dur: 0.28 },
      { freq: 277, dur: 0.28 },
      { freq: 311, dur: 0.36 },
      { freq: 277, dur: 0.24 },
      { freq: 349, dur: 0.32 },
      { freq: 311, dur: 0.24 },
      { freq: 392, dur: 0.36 },
      { freq: 349, dur: 0.28 },
      { freq: 466, dur: 0.4 },
      { freq: 392, dur: 0.32 },
      { freq: 523, dur: 0.72 }
    ]
  };

  let ctx = null;
  function ac() {
    const Ctor = root.AudioContext || root.webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return ctx;
  }

  function tone(freq, dur) {
    const audio = ac();
    if (!audio) return;
    voice(audio, freq, audio.currentTime, dur, 0.03, false);
  }

  function voice(audio, freq, start, dur, level, overtone) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level, start + Math.min(0.03, dur * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain);
    if (overtone) {
      const over = audio.createOscillator();
      over.type = 'triangle';
      over.frequency.value = freq * 1.5;
      over.connect(gain);
      over.start(start);
      over.stop(start + dur);
    }
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + dur);
  }

  function playScore(name) {
    const notes = PHRASES[name];
    if (!notes) return false;
    const audio = ac();
    if (!audio) return false;
    let t = audio.currentTime + 0.02;
    for (let i = 0; i < notes.length; i++) {
      voice(audio, notes[i].freq, t, notes[i].dur, 0.045, true);
      t += notes[i].dur * 0.86;
    }
    return true;
  }

  const api = {
    phrases: PHRASES,
    playScore: playScore,
    confirm: function () { tone(523, 0.08); },
    harm: function () { tone(196, 0.12); },
    attune: function () { tone(659, 0.09); }
  };
  root.AetherAudio = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
