(function (root) {
  const HARMONICS = ['Cindersong', 'Brine', 'Stratum', 'Draft', 'Gloom', 'Biteroot', 'Rivet', 'Spark', 'Bile'];

  // Circulant: each Harmonic is strong against the next two. Weakness is the inverse.
  const HARMONIC_STRONG = {};
  for (let i = 0; i < HARMONICS.length; i++) {
    HARMONIC_STRONG[HARMONICS[i]] = [
      HARMONICS[(i + 1) % HARMONICS.length],
      HARMONICS[(i + 2) % HARMONICS.length]
    ];
  }

  const MOTIFS = [
    { id: 'hush-ember', name: 'Hush Ember', harmonic: 'Cindersong', cls: 'Kindling', power: 24, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 46, description: 'A small heat-hum used while Attuning.' },
    { id: 'flare-lattice', name: 'Flare Lattice', harmonic: 'Cindersong', cls: 'Cindersong', power: 48, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 12, description: 'A lattice of hot light.' },
    { id: 'coal-spiral', name: 'Coal Spiral', harmonic: 'Cindersong', cls: 'Cindersong', power: 70, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 6, description: 'A tight spiral of stored heat.' },
    { id: 'ember-ring', name: 'Ember Ring', harmonic: 'Cindersong', cls: 'Cindersong', power: 36, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 18, description: 'A ring of embers that closes slowly.' },
    { id: 'tide-murmur', name: 'Tide Murmur', harmonic: 'Brine', cls: 'Kindling', power: 24, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 46, description: 'A low water-hum used while Attuning.' },
    { id: 'melt-ribbon', name: 'Melt Ribbon', harmonic: 'Brine', cls: 'Brine', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 12, description: 'A ribbon of cold meltwater.' },
    { id: 'drown-glass', name: 'Drown Glass', harmonic: 'Brine', cls: 'Brine', power: 68, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 6, description: 'Pressure like deep glass.' },
    { id: 'brine-lens', name: 'Brine Lens', harmonic: 'Brine', cls: 'Brine', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 18, description: 'A focusing sheet of brine.' },
    { id: 'crag-hum', name: 'Crag Hum', harmonic: 'Stratum', cls: 'Kindling', power: 24, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 46, description: 'A stone-hum used while Attuning.' },
    { id: 'slab-press', name: 'Slab Press', harmonic: 'Stratum', cls: 'Stratum', power: 52, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A flat press of layered rock.' },
    { id: 'stone-choir', name: 'Stone Choir', harmonic: 'Stratum', cls: 'Stratum', power: 66, accuracy: 90, cadenceCost: 4, cadenceMax: 8, harmony: 8, description: 'Several stones answer at once.' },
    { id: 'crag-bind', name: 'Crag Bind', harmonic: 'Stratum', cls: 'Stratum', power: 36, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 16, description: 'Grit locks around a limb of light.' },
    { id: 'gust-thread', name: 'Gust Thread', harmonic: 'Draft', cls: 'Kindling', power: 24, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 46, description: 'A thin air-hum used while Attuning.' },
    { id: 'veil-shear', name: 'Veil Shear', harmonic: 'Draft', cls: 'Draft', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 12, description: 'A cut of moving air.' },
    { id: 'veil-rush', name: 'Veil Rush', harmonic: 'Draft', cls: 'Draft', power: 64, accuracy: 90, cadenceCost: 4, cadenceMax: 8, harmony: 8, description: 'A sudden crowded gust.' },
    { id: 'draft-needle', name: 'Draft Needle', harmonic: 'Draft', cls: 'Draft', power: 38, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 16, description: 'A narrow needle of wind.' },
    { id: 'dusk-whisper', name: 'Dusk Whisper', harmonic: 'Gloom', cls: 'Kindling', power: 24, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 46, description: 'A dusk-hum used while Attuning.' },
    { id: 'shade-fold', name: 'Shade Fold', harmonic: 'Gloom', cls: 'Gloom', power: 48, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 12, description: 'A fold of quiet shade.' },
    { id: 'hollow-chord', name: 'Hollow Chord', harmonic: 'Gloom', cls: 'Gloom', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 6, description: 'A chord from an empty place.' },
    { id: 'dusk-ring', name: 'Dusk Ring', harmonic: 'Gloom', cls: 'Gloom', power: 36, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 16, description: 'A slow ring of dusk.' },
    { id: 'thorn-lull', name: 'Thorn Lull', harmonic: 'Biteroot', cls: 'Kindling', power: 24, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 46, description: 'A thorn-hum used while Attuning.' },
    { id: 'bloom-latch', name: 'Bloom Latch', harmonic: 'Biteroot', cls: 'Biteroot', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 12, description: 'A bloom that closes on contact.' },
    { id: 'frond-rake', name: 'Frond Rake', harmonic: 'Biteroot', cls: 'Biteroot', power: 68, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 6, description: 'Long fronds drawn inward.' },
    { id: 'thorn-bind', name: 'Thorn Bind', harmonic: 'Biteroot', cls: 'Biteroot', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 16, description: 'Thorns knot a held note.' },
    { id: 'bolt-hum', name: 'Bolt Hum', harmonic: 'Rivet', cls: 'Kindling', power: 24, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 46, description: 'A metal-hum used while Attuning.' },
    { id: 'rivet-press', name: 'Rivet Press', harmonic: 'Rivet', cls: 'Rivet', power: 52, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A press of set rivets.' },
    { id: 'anvil-chord', name: 'Anvil Chord', harmonic: 'Rivet', cls: 'Rivet', power: 70, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 6, description: 'One heavy metal chord.' },
    { id: 'bolt-shear', name: 'Bolt Shear', harmonic: 'Rivet', cls: 'Rivet', power: 36, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 16, description: 'A short shear of force.' },
    { id: 'arc-hum', name: 'Arc Hum', harmonic: 'Spark', cls: 'Kindling', power: 24, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 46, description: 'A spark-hum used while Attuning.' },
    { id: 'flick-lane', name: 'Flick Lane', harmonic: 'Spark', cls: 'Spark', power: 46, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 12, description: 'A lane of quick light.' },
    { id: 'charge-crown', name: 'Charge Crown', harmonic: 'Spark', cls: 'Spark', power: 68, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 6, description: 'A crown of stored charge.' },
    { id: 'arc-needle', name: 'Arc Needle', harmonic: 'Spark', cls: 'Spark', power: 38, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 16, description: 'A needle-thin arc.' },
    { id: 'spore-hum', name: 'Spore Hum', harmonic: 'Bile', cls: 'Kindling', power: 24, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 46, description: 'A spore-hum used while Attuning.' },
    { id: 'blight-seep', name: 'Blight Seep', harmonic: 'Bile', cls: 'Bile', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 12, description: 'A seep of bitter light.' },
    { id: 'venom-thread', name: 'Venom Thread', harmonic: 'Bile', cls: 'Bile', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 6, description: 'Threads of sharp residue.' },
    { id: 'spore-ring', name: 'Spore Ring', harmonic: 'Bile', cls: 'Bile', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 16, description: 'A ring of drifting spores.' }
  ];

  function ward(spike, resist) {
    const w = {};
    for (let i = 0; i < HARMONICS.length; i++) w[HARMONICS[i]] = 1;
    w[spike] = 1.45;
    w[resist] = 0.72;
    return w;
  }

  const RESONANTS = [
    {
      id: 'brinember', name: 'Brinember', primary: 'Cindersong', secondary: null,
      rarity: 'common', plan: 'crystalline', artSeed: 1103, pitch: 'Low',
      baseStats: { vigor: 72, focus: 50, guard: 48, spirit: 64, edge: 46, tempo: 52 },
      baseWard: ward('Brine', 'Stratum'),
      learnset: ['hush-ember', 'ember-ring', 'flare-lattice'],
      flavor: 'A cooled shard of starlight that hums when the yard is still.',
      habitat: ['yard'],
      ascension: { to: 'tindflare', minLevel: 16, minResonance: 120, condition: { kind: 'bond_peak', resonance: 120 } }
    },
    {
      id: 'kalflare', name: 'Kalflare', primary: 'Cindersong', secondary: null,
      rarity: 'uncommon', plan: 'orbiting', artSeed: 2209, pitch: 'High',
      baseStats: { vigor: 68, focus: 70, guard: 50, spirit: 96, edge: 48, tempo: 80 },
      baseWard: ward('Cindersong', 'Draft'),
      learnset: ['hush-ember', 'flare-lattice', 'coal-spiral'],
      flavor: 'Two cinders orbit a hollow core and never quite touch.',
      habitat: ['yard']
    },
    {
      id: 'mortide', name: 'Mortide', primary: 'Brine', secondary: null,
      rarity: 'common', plan: 'tidal', artSeed: 3317, pitch: 'Mid',
      baseStats: { vigor: 74, focus: 46, guard: 60, spirit: 62, edge: 54, tempo: 42 },
      baseWard: ward('Draft', 'Cindersong'),
      learnset: ['tide-murmur', 'brine-lens', 'melt-ribbon'],
      flavor: 'A standing wave that remembers every shore it has left.',
      habitat: ['yard'],
      ascension: { to: 'lumtide', minLevel: 16, minResonance: 120, condition: { kind: 'motif_category', cls: 'Kindling', uses: 5 } }
    },
    {
      id: 'orumelt', name: 'Orumelt', primary: 'Brine', secondary: null,
      rarity: 'uncommon', plan: 'laminar', artSeed: 4421, pitch: 'Low',
      baseStats: { vigor: 78, focus: 60, guard: 76, spirit: 70, edge: 66, tempo: 58 },
      baseWard: ward('Brine', 'Stratum'),
      learnset: ['tide-murmur', 'melt-ribbon', 'drown-glass'],
      flavor: 'Thin sheets of melt stacked until they ring like glass.',
      habitat: ['yard']
    },
    {
      id: 'veshcrag', name: 'Veshcrag', primary: 'Stratum', secondary: null,
      rarity: 'common', plan: 'geomorphic', artSeed: 5533, pitch: 'Low',
      baseStats: { vigor: 86, focus: 64, guard: 78, spirit: 40, edge: 68, tempo: 34 },
      baseWard: ward('Cindersong', 'Draft'),
      learnset: ['crag-hum', 'crag-bind', 'slab-press'],
      flavor: 'A walking mesa with a crack of light for a mouth.',
      habitat: ['yard'],
      ascension: { to: 'oskslab', minLevel: 16, minResonance: 120, condition: { kind: 'no_faint' } }
    },
    {
      id: 'pellslab', name: 'Pellslab', primary: 'Stratum', secondary: null,
      rarity: 'uncommon', plan: 'lattice', artSeed: 6647, pitch: 'High',
      baseStats: { vigor: 80, focus: 62, guard: 90, spirit: 54, edge: 84, tempo: 46 },
      baseWard: ward('Stratum', 'Brine'),
      learnset: ['crag-hum', 'slab-press', 'stone-choir'],
      flavor: 'A mineral grid that holds small echoes in every cell.',
      habitat: ['yard']
    },
    {
      id: 'draygust', name: 'Draygust', primary: 'Draft', secondary: null,
      rarity: 'common', plan: 'filament', artSeed: 7759, pitch: 'Mid',
      baseStats: { vigor: 60, focus: 52, guard: 40, spirit: 66, edge: 42, tempo: 96 },
      baseWard: ward('Stratum', 'Cindersong'),
      learnset: ['gust-thread', 'draft-needle', 'veil-shear'],
      flavor: 'Loose filaments of air knotted around a quiet center.',
      habitat: ['yard']
    },
    {
      id: 'wynveil', name: 'Wynveil', primary: 'Draft', secondary: null,
      rarity: 'uncommon', plan: 'coiled', artSeed: 8861, pitch: 'High',
      baseStats: { vigor: 64, focus: 58, guard: 48, spirit: 88, edge: 50, tempo: 98 },
      baseWard: ward('Draft', 'Brine'),
      learnset: ['gust-thread', 'veil-shear', 'veil-rush'],
      flavor: 'A coil of veil-wind that tightens when it is watched.',
      habitat: ['yard']
    },

    {
      id: 'nyxshade', name: 'Nyxshade', primary: 'Gloom', secondary: null,
      rarity: 'common', plan: 'porous', artSeed: 9913, pitch: 'Mid',
      baseStats: { vigor: 70, focus: 44, guard: 50, spirit: 72, edge: 58, tempo: 48 },
      baseWard: ward('Spark', 'Cindersong'),
      learnset: ['dusk-whisper', 'dusk-ring', 'shade-fold'],
      flavor: 'A porous dusk that keeps small silences in its holes.',
      habitat: ['marches']
    },
    {
      id: 'nixadusk', name: 'Nixadusk', primary: 'Gloom', secondary: null,
      rarity: 'uncommon', plan: 'coiled', artSeed: 10111, pitch: 'Low',
      baseStats: { vigor: 64, focus: 58, guard: 46, spirit: 90, edge: 52, tempo: 96 },
      baseWard: ward('Gloom', 'Brine'),
      learnset: ['dusk-whisper', 'shade-fold', 'hollow-chord'],
      flavor: 'A coil of dusk that tightens when a phrase ends.',
      habitat: ['marches']
    },
    {
      id: 'virethorn', name: 'Virethorn', primary: 'Biteroot', secondary: null,
      rarity: 'common', plan: 'bloom', artSeed: 11221, pitch: 'Mid',
      baseStats: { vigor: 76, focus: 50, guard: 54, spirit: 68, edge: 60, tempo: 40 },
      baseWard: ward('Cindersong', 'Rivet'),
      learnset: ['thorn-lull', 'thorn-bind', 'bloom-latch'],
      flavor: 'A bloom of thorns that opens only to a matching hum.',
      habitat: ['marches']
    },
    {
      id: 'solmbloom', name: 'Solmbloom', primary: 'Biteroot', secondary: null,
      rarity: 'uncommon', plan: 'filament', artSeed: 12323, pitch: 'High',
      baseStats: { vigor: 72, focus: 66, guard: 58, spirit: 84, edge: 62, tempo: 70 },
      baseWard: ward('Biteroot', 'Draft'),
      learnset: ['thorn-lull', 'bloom-latch', 'frond-rake'],
      flavor: 'Filaments tipped with pale blooms, each one a held note.',
      habitat: ['cut']
    },
    {
      id: 'quinbolt', name: 'Quinbolt', primary: 'Rivet', secondary: null,
      rarity: 'common', plan: 'lattice', artSeed: 13427, pitch: 'Low',
      baseStats: { vigor: 68, focus: 78, guard: 72, spirit: 36, edge: 64, tempo: 44 },
      baseWard: ward('Spark', 'Bile'),
      learnset: ['bolt-hum', 'bolt-shear', 'rivet-press'],
      flavor: 'A walking lattice of bolts that ticks in three-time.',
      habitat: ['cut']
    },
    {
      id: 'thurbolt', name: 'Thurbolt', primary: 'Rivet', secondary: null,
      rarity: 'uncommon', plan: 'geomorphic', artSeed: 14531, pitch: 'High',
      baseStats: { vigor: 84, focus: 80, guard: 86, spirit: 48, edge: 70, tempo: 40 },
      baseWard: ward('Rivet', 'Gloom'),
      learnset: ['bolt-hum', 'rivet-press', 'anvil-chord'],
      flavor: 'A squat anvil-body that answers only heavy phrases.',
      habitat: ['cut']
    },
    {
      id: 'myrrarc', name: 'Myrrarc', primary: 'Spark', secondary: null,
      rarity: 'common', plan: 'orbiting', artSeed: 15641, pitch: 'High',
      baseStats: { vigor: 58, focus: 60, guard: 40, spirit: 74, edge: 42, tempo: 92 },
      baseWard: ward('Brine', 'Stratum'),
      learnset: ['arc-hum', 'arc-needle', 'flick-lane'],
      flavor: 'A bright arc chasing itself around an empty center.',
      habitat: ['ridge']
    },
    {
      id: 'sevflick', name: 'Sevflick', primary: 'Spark', secondary: null,
      rarity: 'uncommon', plan: 'filament', artSeed: 16753, pitch: 'Mid',
      baseStats: { vigor: 62, focus: 72, guard: 44, spirit: 98, edge: 46, tempo: 88 },
      baseWard: ward('Spark', 'Biteroot'),
      learnset: ['arc-hum', 'flick-lane', 'charge-crown'],
      flavor: 'Seven filaments that flick between charge and quiet.',
      habitat: ['ridge']
    },
    {
      id: 'karuspore', name: 'Karuspore', primary: 'Bile', secondary: null,
      rarity: 'common', plan: 'colonial', artSeed: 17863, pitch: 'Low',
      baseStats: { vigor: 80, focus: 48, guard: 62, spirit: 70, edge: 74, tempo: 36 },
      baseWard: ward('Stratum', 'Draft'),
      learnset: ['spore-hum', 'spore-ring', 'blight-seep'],
      flavor: 'A colony of spores that shares one slow pulse.',
      habitat: ['ridge']
    },
    {
      id: 'vireblight', name: 'Vireblight', primary: 'Bile', secondary: null,
      rarity: 'uncommon', plan: 'porous', artSeed: 18971, pitch: 'High',
      baseStats: { vigor: 76, focus: 64, guard: 70, spirit: 82, edge: 78, tempo: 48 },
      baseWard: ward('Bile', 'Cindersong'),
      learnset: ['spore-hum', 'blight-seep', 'venom-thread'],
      flavor: 'Porous blight that weeps a bright, bitter thread.',
      habitat: ['ridge']
    },

    {
      id: 'tindflare', name: 'Tindflare', primary: 'Cindersong', secondary: null,
      rarity: 'rare', plan: 'orbiting', artSeed: 20107, pitch: 'High',
      baseStats: { vigor: 78, focus: 74, guard: 60, spirit: 100, edge: 58, tempo: 86 },
      baseWard: ward('Cindersong', 'Brine'),
      learnset: ['coal-spiral', 'ember-ring', 'flare-lattice'],
      flavor: 'The shard has opened. Two flares now share one orbit.',
      habitat: [],
      fromAscension: true
    },
    {
      id: 'lumtide', name: 'Lumtide', primary: 'Brine', secondary: null,
      rarity: 'rare', plan: 'tidal', artSeed: 21209, pitch: 'Low',
      baseStats: { vigor: 82, focus: 68, guard: 80, spirit: 88, edge: 72, tempo: 64 },
      baseWard: ward('Brine', 'Draft'),
      learnset: ['drown-glass', 'melt-ribbon', 'brine-lens'],
      flavor: 'A taller tide, lit from inside, that keeps the shore it came from.',
      habitat: [],
      fromAscension: true
    },
    {
      id: 'oskslab', name: 'Oskslab', primary: 'Stratum', secondary: null,
      rarity: 'rare', plan: 'geomorphic', artSeed: 22313, pitch: 'Mid',
      baseStats: { vigor: 96, focus: 70, guard: 92, spirit: 52, edge: 80, tempo: 48 },
      baseWard: ward('Stratum', 'Spark'),
      learnset: ['stone-choir', 'slab-press', 'crag-bind'],
      flavor: 'The mesa has set. Light runs in a straight seam through the stone.',
      habitat: [],
      fromAscension: true
    }
  ];

  const YARD = [
    '####################',
    '#H.................#',
    '#......gggggg......#',
    '#..N...gggggg......#',
    '#......gggggg......#',
    '#..................#',
    '#.......SSSS.......#',
    '#.......SSSS.......#',
    '#..................#',
    '#....gggggg........#',
    '#....gggggg........#',
    '#..................#',
    '#@..............rD.#',
    '####################'
  ];

  const MARCHES = [
    '####################',
    '#eH................#',
    '#......gggggg......#',
    '#..N...gggggg......#',
    '#......gggggg......#',
    '#..................#',
    '#.....SSSS.........#',
    '#.....SSSS.........#',
    '#..........gggg....#',
    '#..........gggg....#',
    '#~~................#',
    '#~~................#',
    '#B..............rD.#',
    '####################'
  ];

  const CUT = [
    '####################',
    '#e................H#',
    '#....gggg..........#',
    '#....gggg.....N....#',
    '#....gggg..........#',
    '#.............SSSS.#',
    '#.............SSSS.#',
    '#..................#',
    '#..gggggg..........#',
    '#..gggggg..........#',
    '#..................#',
    '#..................#',
    '#B..............rD.#',
    '####################'
  ];

  const RIDGE = [
    '####################',
    '#e....gggg.........#',
    '#......gggg...H....#',
    '#......gggg........#',
    '#..N...............#',
    '#..........SSSS....#',
    '#..........SSSS....#',
    '#..................#',
    '#gggg..............#',
    '#gggg..............#',
    '#..................#',
    '#..................#',
    '#B...............r.#',
    '####################'
  ];

  const ZONES = {
    yard: {
      id: 'yard',
      name: 'Lumenfall Yard',
      wardenId: 'solm',
      links: { D: 'marches' },
      levelMin: 3,
      levelMax: 5,
      encounters: ['brinember', 'kalflare', 'mortide', 'orumelt', 'veshcrag', 'pellslab', 'draygust', 'wynveil'],
      map: YARD
    },
    marches: {
      id: 'marches',
      name: 'Brine Marches',
      wardenId: 'quorin',
      links: { B: 'yard', D: 'cut' },
      levelMin: 6,
      levelMax: 9,
      encounters: ['mortide', 'orumelt', 'nyxshade', 'nixadusk', 'virethorn'],
      map: MARCHES
    },
    cut: {
      id: 'cut',
      name: 'Stratum Cut',
      wardenId: 'grav',
      links: { B: 'marches', D: 'ridge' },
      levelMin: 9,
      levelMax: 12,
      encounters: ['veshcrag', 'pellslab', 'solmbloom', 'quinbolt', 'thurbolt'],
      map: CUT
    },
    ridge: {
      id: 'ridge',
      name: 'Spark Ridge',
      wardenId: 'odel',
      links: { B: 'cut' },
      levelMin: 12,
      levelMax: 15,
      encounters: ['myrrarc', 'sevflick', 'karuspore', 'vireblight', 'draygust'],
      map: RIDGE
    }
  };

  const WARDENS = {
    solm: {
      id: 'solm',
      name: 'Warden Solm',
      sanctum: 'Sanctum of Cindersong',
      intro: 'I keep the first Sanctum. If your Choir can answer heat and haste, the yard will remember you. If not, the grass is still there. The east gate opens only after this phrase.',
      win: 'The Sanctum hears you. The marches are past the east gate. Do not waste the song on silence.',
      loss: 'This is not the end of the song. It is only a missed phrase. The lamp by the wall will restore your Choir.',
      rules: null,
      team: [
        { speciesId: 'kalflare', level: 7 },
        { speciesId: 'wynveil', level: 8 }
      ]
    },
    quorin: {
      id: 'quorin',
      name: 'Warden Quorin',
      sanctum: 'Sanctum of Brine',
      intro: 'I keep the marches. This Sanctum hears only the Resonant you place forward. The rest of the Choir stays outside the phrase.',
      win: 'One voice was enough. The cut past the east gate will test whether you can let a wounded song leave.',
      loss: 'The bench was never going to save this phrase. Choose a stronger forward voice and return.',
      rules: { lockSwitch: true },
      team: [
        { speciesId: 'orumelt', level: 10 },
        { speciesId: 'nyxshade', level: 11 }
      ]
    },
    grav: {
      id: 'grav',
      name: 'Warden Grav',
      sanctum: 'Sanctum of Stratum',
      intro: 'I keep the cut. My Resonants may withdraw while they can still sing. You do not get a quiet ending. You get the next voice.',
      win: 'You let the withdrawal happen and still finished the phrase. The ridge is open.',
      loss: 'Stone can leave a phrase and still win it. Rest at the lamp and come back.',
      rules: { reliefAtHalf: true },
      team: [
        { speciesId: 'pellslab', level: 13 },
        { speciesId: 'quinbolt', level: 14 }
      ]
    },
    odel: {
      id: 'odel',
      name: 'Warden Odel',
      sanctum: 'Sanctum of Spark',
      intro: 'I keep the ridge. This Sanctum refuses any Motif whose Harmonic is not your forward Resonant\'s own. Bring a voice that can sing itself.',
      win: 'Your own Harmonic held. Four Sanctums have an answer. The fracture is still wider than this ridge.',
      loss: 'A borrowed Harmonic dies in this room. Attune a voice whose own song matches, then return.',
      rules: { primaryLock: true },
      team: [
        { speciesId: 'myrrarc', level: 15 },
        { speciesId: 'sevflick', level: 16 },
        { speciesId: 'karuspore', level: 16 }
      ]
    }
  };

  const STRINGS = {
    title: 'Aetherwild',
    blurb: 'The Lumenfall is fracturing. Resonants are going quiet. You walk as an Attunement Surveyor and record what still sings.',
    keeper: 'I keep the yard lamp. Deep grass hides wild Resonants. Attunement gives you three Hums: Low, Mid, or High, or the Harmonic their Ward spikes toward. A Kindling Motif loosens Guard further. Your Choir holds four. One more may wait in reserve. Warden Solm keeps the Sanctum in the middle. After that phrase, the east gate opens onto the marches.',
    pathShut: 'The path beyond is not on this survey yet.',
    sanctumNeeds: 'Your Choir has no Vigor left to offer.',
    sanctumDone: 'This Sanctum is already answered. The Warden lets the gate stand open.',
    healed: 'The lamp restores Vigor and Cadence.',
    conductor: [
      'A figure stands where the gate-light thins, hands empty, voice level.',
      'Conductor: You cleared a Sanctum, so you will hear this plainly. I am the Conductor.',
      'Conductor: The Lumenfall is tearing. Every Resonant that still sings pulls the wound wider. I would quiet them all, on purpose, so Aetherwild does not split.',
      'Conductor: Hate the method if you must. I am trying to save what the song is breaking.'
    ],
    conductorAnswers: [
      { id: 'sing', label: 'A silent world is already gone.', line: 'You: A world that cannot sing is already gone. I will keep recording.' },
      { id: 'reason', label: 'The fracture has a reason.', line: 'You: I will remember that the fracture has a reason. I still will not help you still the Choir.' }
    ],
    winSlice: 'The Sanctum is answered. The survey keeps its song, for now.',
    lossSlice: 'Your Choir falls silent. The survey is not over.'
  };

  const SAVE_SCHEMA_KEYS = [
    'version', 'surveyor', 'zone', 'x', 'y', 'active',
    'choir', 'reserve', 'index', 'flags', 'storyBeat', 'rngSeed'
  ];

  const AETHER = {
    SAVE_KEY: 'aetherwild.save.v1',
    SAVE_VERSION: 1,
    LEVEL_CAP: 20,
    CHOIR_MAX: 4,
    HARMONICS: HARMONICS,
    HARMONIC_STRONG: HARMONIC_STRONG,
    MOTIFS: MOTIFS,
    RESONANTS: RESONANTS,
    ZONES: ZONES,
    WARDENS: WARDENS,
    STRINGS: STRINGS,
    SAVE_SCHEMA_KEYS: SAVE_SCHEMA_KEYS,
    FIRST_RESONANCE: ['brinember', 'mortide', 'veshcrag']
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = AETHER;
  root.AETHER = AETHER;
})(typeof globalThis !== 'undefined' ? globalThis : this);
