# Decisions

This tree is a playable vertical slice of Aetherwild. It is not the full game described by the external build brief. Nothing below is claimed as finished unless it is in the files.

## Kept

- World words: Aetherwild, Lumenfall, Resonant, Harmonic, Motif, Cadence, Choir, Censer, Harmonic Index, Attunement, Sanctum, Warden, Phrase, Vigor, Focus, Guard, Spirit, Edge, Tempo, Conductor, Attunement Surveyor, First Resonance.
- Attunement is a three-Hum Guard puzzle. Matching the dominant Ward spike removes 45. The right pitch class removes 25. A wrong Hum adds 15. Kindling removes another 10. Guard is derived from level, rarity, and Ward spread.
- Damage uses a level-and-power base, a same-Harmonic bonus, the global chart, and the defender's Ward for the Motif's Harmonic (the value is how much of that Harmonic they take). Minimum 1 when power is above 0.
- The Harmonic chart is generated as a circulant: each Harmonic is strong against the next two, and weakness is the inverse. Every row has two strengths and two weaknesses.
- Names are original compounds from a fixed syllable bank. Art is procedural canvas. No downloaded sprites. No runtime network.
- Records stay in `localStorage`. A record that fails to parse is copied aside and is not required to be deleted before a new survey.
- Choir size is 4, plus one reserve seat, because that was the slice contract. The brief's Choir of 6 is still not the cap.
- Nine Harmonics. The chart is a circulant over all nine: strong against the next two, weakness derived. Extending the cycle changed which pairs Stratum and Draft answer. That is intentional.
- Eighteen Resonants and thirty-six Motifs. Four zones: Lumenfall Yard, Brine Marches, Stratum Cut, Spark Ridge. Four Sanctums with different trials: an open phrase, a forward-only phrase, withdrawal under half Vigor, and a phrase that refuses any Harmonic but the forward Resonant's own.

## Not built yet

- Index size 78 and Motif count 120. Sixty Resonants and eighty-four Motifs are still missing. No three-stage lines and no Ascension.
- Level cap is 20, not 50.
- Four Sanctums remain, including the Chorus and the Prime Voice. Five biomes from a set of nine are still absent.
- A Resonance Vault larger than one reserve seat. Letting a hum go is permanent in this slice.
- Secondary Harmonics, status phrases (Dimmed, Riven, Brambled, Scorched), stat stages, and Cadence-empty substitution beyond a hard refusal.
- The brief's contradictory Ward line that reads the attacker's Ward. Incoming Ward from section 1.4 is what the slice multiplies.
- A wild Resonant does not answer during the three Hums. On a failed Attunement it simply leaves.
- TypeScript, Vite, Vitest, Playwright, and the eight toolchain gates. Static files are required so Pages can serve `main` with no build. Checks are `node test/check.mjs`.
- Procedural bitmap font, gamepad, Web Audio score, contact sheet, 10,000-phrase fuzz, and a headless browser walk of the canvas. The node check covers data, chart balance, Attunement arithmetic, and short scripted phrases.
- Tokens, shops, day cycle, export string, migrations beyond version 1, and i18n tables. Player-facing lines live in `js/data.js` where the slice has them, and also in the engine log sentences.
- The external brief is not vendored. It embeds a third-party name list, which does not belong in this public tree.

## Later, if the slice holds

Extend the chart to nine Harmonics, add zones and Wardens with different trial rules, then Ascension as a pure function with a visible result. Do not mark those done until they are playable.
