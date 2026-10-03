(function (root) {
  let ctx = null;
  function ac() {
    const Ctor = root.AudioContext || root.webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur) {
    const audio = ac();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.03, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + dur);
  }
  root.AetherAudio = {
    confirm: function () { tone(523, 0.08); },
    harm: function () { tone(196, 0.12); },
    attune: function () { tone(659, 0.09); }
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
