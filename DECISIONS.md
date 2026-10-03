# Decisions

This tree is a playable vertical slice of Aetherwild. It is not the full game described by the external build brief. Nothing below is claimed as finished unless it is in the files.

## Kept

- World words: Aetherwild, Lumenfall, Resonant, Harmonic, Motif, Cadence, Choir, Censer, Harmonic Index, Attunement, Sanctum, Warden, Phrase, Vigor, Focus, Guard, Spirit, Edge, Tempo, Conductor, Attunement Surveyor, First Resonance.
- Attunement is a three-Hum Guard puzzle. Matching the dominant Ward spike removes 45. The right pitch class removes 25. A wrong Hum adds 15. Kindling removes another 10. Guard is derived from level, rarity, and Ward spread.
- Damage uses a level-and-power base, a same-Harmonic bonus, the global chart, and the defender's Ward for the Motif's Harmonic (the value is how much of that Harmonic they take). Minimum 1 when power is above 0.
- The Harmonic chart is generated as a circulant: each Harmonic is strong against the next two, and weakness is the inverse. Every row has two strengths and two weaknesses.
- Names are original compounds from a fixed syllable bank. Art is procedural canvas. No downloaded sprites. No runtime network.
- Records stay in `localStorage`. A record that fails to parse is copied aside and is not required to be deleted before a new survey.
- Choir size is 4. The Vault holds 3 seats. The brief's Choir of 6 is still not the cap.
- Nine Harmonics. The chart is a circulant over all nine: strong against the next two, weakness derived. Extending the cycle changed which pairs Stratum and Draft answer. That is intentional.
- Eighty-one Resonants and one hundred twenty Motifs: 12 Kindling, 18 Pulse, 14 Guard, and 76 across the nine Harmonic classes. Eight Sanctum zones on foot, then Chorus Hall. Eight Sanctum trials: open phrase, forward only, withdrawal under half Vigor, own Harmonic only, eight-phrase limit, Kindling only, Choir rotation, and a softened first phrase.

## Not built yet

- Letting a hum go is permanent when the Choir and the Vault are both full.
- Secondary Harmonics, stat stages, and Cadence-empty substitution beyond a hard refusal.
- The brief's contradictory Ward line that reads the attacker's Ward. Incoming Ward from section 1.4 is what the slice multiplies.
- A wild Resonant does not answer during the three Hums. On a failed Attunement it simply leaves.
- TypeScript, Vite, Vitest, Playwright, and the eight toolchain gates. Static files are required so Pages can serve `main` with no build. Checks are `node test/check.mjs`.
- Procedural bitmap font, gamepad, contact sheet, 10,000-phrase fuzz, and a headless browser walk of the canvas. Short sine tones still play on a result. A generated score plays at a wild encounter, a Sanctum clear, and the Prime Voice ending. The node check covers data, chart balance, Attunement, Ascension, Sanctum rules, motif quotas, the score schedule, and short scripted phrases. A phrase that reaches 200 ends by remaining Vigor.
- Day cycle, migrations beyond version 1, and i18n tables. A record can be shared as text from the yard and read back. An older record whose reserve was one Resonant is read as a one-seat Vault, and a missing Shard purse loads as zero. Player-facing lines live in `js/data.js` where the slice has them, and also in the engine log sentences.
- The external brief is not vendored. It embeds a third-party name list, which does not belong in this public tree.

## Ascension

`evaluateAscension` is pure. It knows five conditions: bond peak, no faint, Motif class uses, Harmonic wins, and zone reached. Brinember, Mortide, and Veshcrag each use one of the first three, at Choir level 16 and Resonance 120, and become Tindflare, Lumtide, and Oskslab. Those three use the same rules again at Choir level 32 and Resonance 180, and become Tindwreath, Lumwell, and Oskspire. A win that crosses the line changes the Resonant in the Choir. Resonance rises by 8 on a quieted foe. The level cap is 50, enforced when experience is applied.

## Stall and Vault

The yard stall is the `P` tile west of the deep grass. Quieting a foe adds Shards. The stall sells a Vigor draught for 8 and a Cadence vial for 6. Both refill numbers the phrase already uses. There is no real-world money. The Vault is `save.reserve`, an array of 3 seats. A full Choir attunes into an empty seat. The Choir screen can move a Resonant into an empty seat or swap a seat with Choir 1.

## Chorus and Prime Voice

The east gate of Rivet Foundry opens only after all eight Sanctums. Chorus Hall then fights four voices in order. A loss heals you in the hall and does not erase a voice already answered. After the fourth, the dais starts the Prime Voice, a three-Resonant phrase. Winning it sets `flags.primeClear` and plays the ending lines. That is the ending that exists. It is not a repaired world.

## Score

`js/audio.js` schedules original interval rows with Web Audio: a sine and a quiet triangle a fifth above. Encounter, Sanctum clear, and the Prime Voice ending each have their own row. Nothing is sampled from another piece, and there is no audio file to fetch.

## Pulse and Guard

A Pulse Motif either sets a status or recoils. Scorched and Brambled take a sixteenth of Vigor at the next phrase and cut that singer's damage to three quarters. Dimmed holds the phrase. Riven breaks about one phrase in four. Recoil takes a quarter of the Vigor just dealt, at least 1, from the singer. A Guard Motif raises the singer's Ward against that Motif's Harmonic: the damage-taken multiplier drops by 0.12 and does not go below 0.55. The lamp clears a status.

## Later

TypeScript, Vite, and Playwright stay open on purpose. GitHub Pages serves the static files at the root of `main`, so this tree does not take a build step. Do not start that migration here.
