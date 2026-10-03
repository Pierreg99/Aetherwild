# Aetherwild

A browser survey of the Lumenfall. Resonants are living shards of a dead star. You are an Attunement Surveyor. This repository is a playable slice, not the finished eight-Sanctum game. See `DECISIONS.md` for what is still open.

## Play on the web

https://pierreg99.github.io/Aetherwild/

## Play locally

From this directory:

```
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/

There is no build step. `index.html` loads plain scripts. Use a local server because some browsers refuse script files opened directly from disk. GitHub Pages serves the same files from the root of `main`.

## Controls

- New survey: choose a name and one First Resonance. Continue reads this browser's stored record (`aetherwild.save.v1`).
- Walk with the arrow keys or WASD, or the on-screen pad. E or Speak uses a facing tile.
- Deep grass may begin a wild phrase.
- In a phrase: keys 1–4 play Motifs, Q attunes, F leaves, S calls another Resonant. The same actions are buttons.
- Attunement gives three Hums. A Harmonic name that matches the Ward spike, or the right pitch (Low, Mid, High), lowers Guard. A wrong Hum raises it. Kindling lowers it further. It is not a flat roll. If your forward Resonant is under a quarter of its Vigor, the wild Resonant slips away.
- The Choir holds four Resonants. One more can wait in reserve.
- The lamp tile restores Vigor and Cadence.
- Warden Solm keeps the Sanctum of Cindersong. A win and a loss are both shown. After the first win, the Conductor speaks.

## Check

```
node test/check.mjs
```

## Licence

MIT. Art is drawn on the canvas from seeds in `js/data.js`. The game does not fetch fonts, images, or trackers.
