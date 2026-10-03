(function (root) {
  const HARMONICS = ['Cindersong', 'Brine', 'Stratum', 'Draft'];

  // Circulant: each Harmonic is strong against the next two. Weakness is the inverse.
  const HARMONIC_STRONG = {
    Cindersong: ['Brine', 'Stratum'],
    Brine: ['Stratum', 'Draft'],
    Stratum: ['Draft', 'Cindersong'],
    Draft: ['Cindersong', 'Brine']
  };

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
    { id: 'draft-needle', name: 'Draft Needle', harmonic: 'Draft', cls: 'Draft', power: 38, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 16, description: 'A narrow needle of wind.' }
  ];

  function ward(spike, resist) {
    const w = { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1 };
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
      habitat: ['yard']
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
      habitat: ['yard']
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
      habitat: ['yard']
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
    '#@...............D.#',
    '####################'
  ];

  const ZONES = {
    yard: {
      id: 'yard',
      name: 'Lumenfall Yard',
      wardenId: 'solm',
      links: { D: null },
      levelMin: 3,
      levelMax: 5,
      encounters: ['brinember', 'kalflare', 'mortide', 'orumelt', 'veshcrag', 'pellslab', 'draygust', 'wynveil'],
      map: YARD
    }
  };

  const WARDENS = {
    solm: {
      id: 'solm',
      name: 'Warden Solm',
      sanctum: 'Sanctum of Cindersong',
      intro: 'I keep the first Sanctum. If your Choir can answer heat and haste, the yard will remember you. If not, the grass is still there.',
      win: 'The Sanctum hears you. Carry that answer. Do not waste it on silence.',
      loss: 'This is not the end of the song. It is only a missed phrase. The lamp by the wall will restore your Choir.',
      team: [
        { speciesId: 'kalflare', level: 7 },
        { speciesId: 'wynveil', level: 8 }
      ]
    }
  };

  const STRINGS = {
    title: 'Aetherwild',
    blurb: 'The Lumenfall is fracturing. Resonants are going quiet. You walk as an Attunement Surveyor and record what still sings.',
    keeper: 'I keep the yard lamp. Deep grass hides wild Resonants. Attunement gives you three Hums: Low, Mid, or High, or the Harmonic their Ward spikes toward. A Kindling Motif loosens Guard further. Your Choir holds four. One more may wait in reserve. Warden Solm keeps the Sanctum south of here.',
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
    winSlice: 'The Sanctum of Cindersong is answered. The yard keeps its song, for now.',
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
