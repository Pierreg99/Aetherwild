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
- The Choir holds four Resonants. The Vault holds three more.
- The stall tile in Lumenfall Yard sells a Vigor draught and a Cadence vial for Shards. Shards come from quieting a foe.
- The lamp tile restores Vigor and Cadence.
- Warden Solm keeps the Sanctum in Lumenfall Yard. A win and a loss are both shown. After the first win, the Conductor speaks, and the east gate opens.
- Brine Marches, Stratum Cut, Spark Ridge, Gloom Fen, Biteroot Thorn, Draft Shelf, and Rivet Foundry follow. Each Sanctum is a different trial: forward Resonant only, withdrawal under half Vigor, own Harmonic only, an eight-phrase limit, Kindling only, a required Choir rotation, or a softened first phrase. West gates go back. East gates stay shut until the local Sanctum is answered.
- After all eight Sanctums, the foundry's east gate opens Chorus Hall. Four voices answer in order. The lamp in the hall restores your Choir between them. When the four are quiet, the dais calls the Prime Voice. Winning that phrase ends the survey.


Brinember, Mortide, and Veshcrag can ascend after Choir level 16 and Resonance 120, if their extra condition is met: a bond peak, five Kindling Motifs, or never having gone quiet. Tindflare, Lumtide, and Oskslab can ascend again at level 32 and Resonance 180 under the same kinds of condition. The Index shows those lines as unwritten until then. Levels stop at 50.

Share record copies the survey as text. Read record accepts that text back. A bad record is refused and the current survey stays.

## Check

```
node test/check.mjs
```

## Licence

MIT. Art is drawn on the canvas from seeds in `js/data.js`. The game does not fetch fonts, images, or trackers.
