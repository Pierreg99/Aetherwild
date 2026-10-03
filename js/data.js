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
    { id: 'spore-ring', name: 'Spore Ring', harmonic: 'Bile', cls: 'Bile', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 16, description: 'A ring of drifting spores.' },
    { id: 'brin-glass', name: 'Brin Glass', harmonic: 'Cindersong', cls: 'Guard', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 10, description: 'A Cindersong phrase carried as Brin Glass.' },
    { id: 'tal-glass', name: 'Tal Glass', harmonic: 'Brine', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Brine phrase carried as Tal Glass.' },
    { id: 'mor-glass', name: 'Mor Glass', harmonic: 'Stratum', cls: 'Stratum', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Stratum phrase carried as Mor Glass.' },
    { id: 'vesh-glass', name: 'Vesh Glass', harmonic: 'Draft', cls: 'Draft', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Draft phrase carried as Vesh Glass.' },
    { id: 'kal-glass', name: 'Kal Glass', harmonic: 'Gloom', cls: 'Gloom', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Gloom phrase carried as Kal Glass.' },
    { id: 'oru-glass', name: 'Oru Glass', harmonic: 'Biteroot', cls: 'Biteroot', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Biteroot phrase carried as Oru Glass.' },
    { id: 'dray-glass', name: 'Dray Glass', harmonic: 'Rivet', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Rivet phrase carried as Dray Glass.' },
    { id: 'lum-glass', name: 'Lum Glass', harmonic: 'Spark', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Spark phrase carried as Lum Glass.' },
    { id: 'sev-glass', name: 'Sev Glass', harmonic: 'Bile', cls: 'Bile', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Bile phrase carried as Sev Glass.' },
    { id: 'nixa-glass', name: 'Nixa Glass', harmonic: 'Cindersong', cls: 'Cindersong', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Cindersong phrase carried as Nixa Glass.' },
    { id: 'pell-glass', name: 'Pell Glass', harmonic: 'Brine', cls: 'Brine', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Brine phrase carried as Pell Glass.' },
    { id: 'grav-glass', name: 'Grav Glass', harmonic: 'Stratum', cls: 'Stratum', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Stratum phrase carried as Grav Glass.' },
    { id: 'tind-glass', name: 'Tind Glass', harmonic: 'Draft', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Draft phrase carried as Tind Glass.' },
    { id: 'osk-glass', name: 'Osk Glass', harmonic: 'Gloom', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Gloom phrase carried as Osk Glass.' },
    { id: 'wyn-glass', name: 'Wyn Glass', harmonic: 'Biteroot', cls: 'Biteroot', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Biteroot phrase carried as Wyn Glass.' },
    { id: 'ulm-glass', name: 'Ulm Glass', harmonic: 'Rivet', cls: 'Rivet', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Rivet phrase carried as Ulm Glass.' },
    { id: 'zeph-glass', name: 'Zeph Glass', harmonic: 'Spark', cls: 'Spark', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Spark phrase carried as Zeph Glass.' },
    { id: 'myrr-glass', name: 'Myrr Glass', harmonic: 'Bile', cls: 'Pulse', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Bile phrase carried as Myrr Glass.' },
    { id: 'quin-glass', name: 'Quin Glass', harmonic: 'Cindersong', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Cindersong phrase carried as Quin Glass.' },
    { id: 'karu-glass', name: 'Karu Glass', harmonic: 'Brine', cls: 'Guard', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 10, description: 'A Brine phrase carried as Karu Glass.' },
    { id: 'solm-glass', name: 'Solm Glass', harmonic: 'Stratum', cls: 'Stratum', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Stratum phrase carried as Solm Glass.' },
    { id: 'vire-glass', name: 'Vire Glass', harmonic: 'Draft', cls: 'Draft', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Draft phrase carried as Vire Glass.' },
    { id: 'odel-glass', name: 'Odel Glass', harmonic: 'Gloom', cls: 'Gloom', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Gloom phrase carried as Odel Glass.' },
    { id: 'nyx-glass', name: 'Nyx Glass', harmonic: 'Biteroot', cls: 'Biteroot', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Biteroot phrase carried as Nyx Glass.' },
    { id: 'thur-glass', name: 'Thur Glass', harmonic: 'Rivet', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Rivet phrase carried as Thur Glass.' },
    { id: 'brin-ribbon', name: 'Brin Ribbon', harmonic: 'Spark', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Spark phrase carried as Brin Ribbon.' },
    { id: 'tal-ribbon', name: 'Tal Ribbon', harmonic: 'Bile', cls: 'Bile', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Bile phrase carried as Tal Ribbon.' },
    { id: 'mor-ribbon', name: 'Mor Ribbon', harmonic: 'Cindersong', cls: 'Cindersong', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Cindersong phrase carried as Mor Ribbon.' },
    { id: 'vesh-ribbon', name: 'Vesh Ribbon', harmonic: 'Brine', cls: 'Brine', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Brine phrase carried as Vesh Ribbon.' },
    { id: 'kal-ribbon', name: 'Kal Ribbon', harmonic: 'Stratum', cls: 'Stratum', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Stratum phrase carried as Kal Ribbon.' },
    { id: 'oru-ribbon', name: 'Oru Ribbon', harmonic: 'Draft', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Draft phrase carried as Oru Ribbon.' },
    { id: 'dray-ribbon', name: 'Dray Ribbon', harmonic: 'Gloom', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Gloom phrase carried as Dray Ribbon.' },
    { id: 'lum-ribbon', name: 'Lum Ribbon', harmonic: 'Biteroot', cls: 'Biteroot', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Biteroot phrase carried as Lum Ribbon.' },
    { id: 'sev-ribbon', name: 'Sev Ribbon', harmonic: 'Rivet', cls: 'Rivet', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Rivet phrase carried as Sev Ribbon.' },
    { id: 'nixa-ribbon', name: 'Nixa Ribbon', harmonic: 'Spark', cls: 'Pulse', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Spark phrase carried as Nixa Ribbon.' },
    { id: 'pell-ribbon', name: 'Pell Ribbon', harmonic: 'Bile', cls: 'Bile', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Bile phrase carried as Pell Ribbon.' },
    { id: 'grav-ribbon', name: 'Grav Ribbon', harmonic: 'Cindersong', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Cindersong phrase carried as Grav Ribbon.' },
    { id: 'tind-ribbon', name: 'Tind Ribbon', harmonic: 'Brine', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Brine phrase carried as Tind Ribbon.' },
    { id: 'osk-ribbon', name: 'Osk Ribbon', harmonic: 'Stratum', cls: 'Guard', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Stratum phrase carried as Osk Ribbon.' },
    { id: 'wyn-ribbon', name: 'Wyn Ribbon', harmonic: 'Draft', cls: 'Draft', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Draft phrase carried as Wyn Ribbon.' },
    { id: 'ulm-ribbon', name: 'Ulm Ribbon', harmonic: 'Gloom', cls: 'Gloom', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Gloom phrase carried as Ulm Ribbon.' },
    { id: 'zeph-ribbon', name: 'Zeph Ribbon', harmonic: 'Biteroot', cls: 'Biteroot', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Biteroot phrase carried as Zeph Ribbon.' },
    { id: 'myrr-ribbon', name: 'Myrr Ribbon', harmonic: 'Rivet', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Rivet phrase carried as Myrr Ribbon.' },
    { id: 'quin-ribbon', name: 'Quin Ribbon', harmonic: 'Spark', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Spark phrase carried as Quin Ribbon.' },
    { id: 'karu-ribbon', name: 'Karu Ribbon', harmonic: 'Bile', cls: 'Bile', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Bile phrase carried as Karu Ribbon.' },
    { id: 'solm-ribbon', name: 'Solm Ribbon', harmonic: 'Cindersong', cls: 'Cindersong', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Cindersong phrase carried as Solm Ribbon.' },
    { id: 'vire-ribbon', name: 'Vire Ribbon', harmonic: 'Brine', cls: 'Brine', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Brine phrase carried as Vire Ribbon.' },
    { id: 'odel-ribbon', name: 'Odel Ribbon', harmonic: 'Stratum', cls: 'Stratum', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Stratum phrase carried as Odel Ribbon.' },
    { id: 'nyx-ribbon', name: 'Nyx Ribbon', harmonic: 'Draft', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Draft phrase carried as Nyx Ribbon.' },
    { id: 'thur-ribbon', name: 'Thur Ribbon', harmonic: 'Gloom', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Gloom phrase carried as Thur Ribbon.' },
    { id: 'brin-spiral', name: 'Brin Spiral', harmonic: 'Biteroot', cls: 'Biteroot', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Biteroot phrase carried as Brin Spiral.' },
    { id: 'tal-spiral', name: 'Tal Spiral', harmonic: 'Rivet', cls: 'Pulse', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Rivet phrase carried as Tal Spiral.' },
    { id: 'mor-spiral', name: 'Mor Spiral', harmonic: 'Spark', cls: 'Spark', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Spark phrase carried as Mor Spiral.' },
    { id: 'vesh-spiral', name: 'Vesh Spiral', harmonic: 'Bile', cls: 'Bile', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Bile phrase carried as Vesh Spiral.' },
    { id: 'kal-spiral', name: 'Kal Spiral', harmonic: 'Cindersong', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Cindersong phrase carried as Kal Spiral.' },
    { id: 'oru-spiral', name: 'Oru Spiral', harmonic: 'Brine', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Brine phrase carried as Oru Spiral.' },
    { id: 'dray-spiral', name: 'Dray Spiral', harmonic: 'Stratum', cls: 'Stratum', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Stratum phrase carried as Dray Spiral.' },
    { id: 'lum-spiral', name: 'Lum Spiral', harmonic: 'Draft', cls: 'Guard', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Draft phrase carried as Lum Spiral.' },
    { id: 'sev-spiral', name: 'Sev Spiral', harmonic: 'Gloom', cls: 'Gloom', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Gloom phrase carried as Sev Spiral.' },
    { id: 'nixa-spiral', name: 'Nixa Spiral', harmonic: 'Biteroot', cls: 'Biteroot', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Biteroot phrase carried as Nixa Spiral.' },
    { id: 'pell-spiral', name: 'Pell Spiral', harmonic: 'Rivet', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Rivet phrase carried as Pell Spiral.' },
    { id: 'grav-spiral', name: 'Grav Spiral', harmonic: 'Spark', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Spark phrase carried as Grav Spiral.' },
    { id: 'tind-spiral', name: 'Tind Spiral', harmonic: 'Bile', cls: 'Bile', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Bile phrase carried as Tind Spiral.' },
    { id: 'osk-spiral', name: 'Osk Spiral', harmonic: 'Cindersong', cls: 'Cindersong', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Cindersong phrase carried as Osk Spiral.' },
    { id: 'wyn-spiral', name: 'Wyn Spiral', harmonic: 'Brine', cls: 'Brine', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Brine phrase carried as Wyn Spiral.' },
    { id: 'ulm-spiral', name: 'Ulm Spiral', harmonic: 'Stratum', cls: 'Stratum', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Stratum phrase carried as Ulm Spiral.' },
    { id: 'zeph-spiral', name: 'Zeph Spiral', harmonic: 'Draft', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Draft phrase carried as Zeph Spiral.' },
    { id: 'myrr-spiral', name: 'Myrr Spiral', harmonic: 'Gloom', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Gloom phrase carried as Myrr Spiral.' },
    { id: 'quin-spiral', name: 'Quin Spiral', harmonic: 'Biteroot', cls: 'Pulse', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Biteroot phrase carried as Quin Spiral.' },
    { id: 'karu-spiral', name: 'Karu Spiral', harmonic: 'Rivet', cls: 'Rivet', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Rivet phrase carried as Karu Spiral.' },
    { id: 'solm-spiral', name: 'Solm Spiral', harmonic: 'Spark', cls: 'Spark', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Spark phrase carried as Solm Spiral.' },
    { id: 'vire-spiral', name: 'Vire Spiral', harmonic: 'Bile', cls: 'Bile', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Bile phrase carried as Vire Spiral.' },
    { id: 'odel-spiral', name: 'Odel Spiral', harmonic: 'Cindersong', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Cindersong phrase carried as Odel Spiral.' },
    { id: 'nyx-spiral', name: 'Nyx Spiral', harmonic: 'Brine', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Brine phrase carried as Nyx Spiral.' },
    { id: 'thur-spiral', name: 'Thur Spiral', harmonic: 'Stratum', cls: 'Stratum', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Stratum phrase carried as Thur Spiral.' },
    { id: 'brin-needle', name: 'Brin Needle', harmonic: 'Draft', cls: 'Draft', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Draft phrase carried as Brin Needle.' },
    { id: 'tal-needle', name: 'Tal Needle', harmonic: 'Gloom', cls: 'Guard', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Gloom phrase carried as Tal Needle.' },
    { id: 'mor-needle', name: 'Mor Needle', harmonic: 'Biteroot', cls: 'Biteroot', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Biteroot phrase carried as Mor Needle.' },
    { id: 'vesh-needle', name: 'Vesh Needle', harmonic: 'Rivet', cls: 'Kindling', power: 26, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Rivet phrase carried as Vesh Needle.' },
    { id: 'kal-needle', name: 'Kal Needle', harmonic: 'Spark', cls: 'Kindling', power: 34, accuracy: 100, cadenceCost: 2, cadenceMax: 14, harmony: 40, description: 'A Spark phrase carried as Kal Needle.' },
    { id: 'oru-needle', name: 'Oru Needle', harmonic: 'Bile', cls: 'Bile', power: 42, accuracy: 100, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Bile phrase carried as Oru Needle.' },
    { id: 'dray-needle', name: 'Dray Needle', harmonic: 'Cindersong', cls: 'Cindersong', power: 50, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Cindersong phrase carried as Dray Needle.' },
    { id: 'lum-needle', name: 'Lum Needle', harmonic: 'Brine', cls: 'Brine', power: 58, accuracy: 95, cadenceCost: 3, cadenceMax: 12, harmony: 10, description: 'A Brine phrase carried as Lum Needle.' },
    { id: 'sev-needle', name: 'Sev Needle', harmonic: 'Stratum', cls: 'Stratum', power: 66, accuracy: 85, cadenceCost: 4, cadenceMax: 8, harmony: 10, description: 'A Stratum phrase carried as Sev Needle.' }
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
    },
    {
      id: 'brinveshember', name: 'Brinveshember', primary: 'Cindersong', secondary: null,
      rarity: 'rare', plan: 'crystalline', artSeed: 30011, pitch: 'Low',
      baseStats: { vigor: 136, focus: 41, guard: 39, spirit: 44, edge: 36, tempo: 34 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1.4, Gloom: 1, Biteroot: 1, Rivet: 0.75, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'ember-ring'],
      flavor: 'A crystalline body that keeps a Cindersong hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'talpellmelt', name: 'Talpellmelt', primary: 'Brine', secondary: null,
      rarity: 'common', plan: 'orbiting', artSeed: 30108, pitch: 'Mid',
      baseStats: { vigor: 111, focus: 44, guard: 44, spirit: 51, edge: 40, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1.4, Biteroot: 1, Rivet: 1, Spark: 0.75, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'tide-murmur'],
      flavor: 'A orbiting body that keeps a Brine hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'mormyrrslab', name: 'Mormyrrslab', primary: 'Stratum', secondary: null,
      rarity: 'common', plan: 'tidal', artSeed: 30205, pitch: 'High',
      baseStats: { vigor: 86, focus: 47, guard: 49, spirit: 58, edge: 44, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1.4, Rivet: 1, Spark: 1, Bile: 0.75 },
      learnset: ['hush-ember', 'flare-lattice', 'melt-ribbon'],
      flavor: 'A tidal body that keeps a Stratum hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'veshthurgust', name: 'Veshthurgust', primary: 'Draft', secondary: null,
      rarity: 'uncommon', plan: 'laminar', artSeed: 30302, pitch: 'Low',
      baseStats: { vigor: 71, focus: 50, guard: 54, spirit: 65, edge: 48, tempo: 52 },
      baseWard: { Cindersong: 0.75, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1.4, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'drown-glass'],
      flavor: 'A laminar body that keeps a Draft hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'kaldrayhollow', name: 'Kaldrayhollow', primary: 'Gloom', secondary: null,
      rarity: 'common', plan: 'geomorphic', artSeed: 30399, pitch: 'Mid',
      baseStats: { vigor: 72, focus: 53, guard: 59, spirit: 72, edge: 52, tempo: 58 },
      baseWard: { Cindersong: 1, Brine: 0.75, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1.4, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'brine-lens'],
      flavor: 'A geomorphic body that keeps a Gloom hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'oruoskfrond', name: 'Oruoskfrond', primary: 'Biteroot', secondary: null,
      rarity: 'common', plan: 'lattice', artSeed: 30496, pitch: 'High',
      baseStats: { vigor: 73, focus: 56, guard: 64, spirit: 79, edge: 56, tempo: 64 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 0.75, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1.4 },
      learnset: ['hush-ember', 'flare-lattice', 'crag-hum'],
      flavor: 'A lattice body that keeps a Biteroot hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'draysolmbolt', name: 'Draysolmbolt', primary: 'Rivet', secondary: null,
      rarity: 'uncommon', plan: 'filament', artSeed: 30593, pitch: 'Low',
      baseStats: { vigor: 74, focus: 59, guard: 69, spirit: 46, edge: 60, tempo: 34 },
      baseWard: { Cindersong: 1.4, Brine: 1, Stratum: 1, Draft: 0.75, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'slab-press'],
      flavor: 'A filament body that keeps a Rivet hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'lummorflick', name: 'Lummorflick', primary: 'Spark', secondary: null,
      rarity: 'rare', plan: 'coiled', artSeed: 30690, pitch: 'Mid',
      baseStats: { vigor: 75, focus: 62, guard: 40, spirit: 53, edge: 64, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 1.4, Stratum: 1, Draft: 1, Gloom: 0.75, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'stone-choir'],
      flavor: 'A coiled body that keeps a Spark hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'sevnixablight', name: 'Sevnixablight', primary: 'Bile', secondary: null,
      rarity: 'common', plan: 'bloom', artSeed: 30787, pitch: 'High',
      baseStats: { vigor: 78, focus: 65, guard: 45, spirit: 60, edge: 36, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1.4, Draft: 1, Gloom: 1, Biteroot: 0.75, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'crag-bind'],
      flavor: 'A bloom body that keeps a Bile hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'nixazephember', name: 'Nixazephember', primary: 'Cindersong', secondary: null,
      rarity: 'uncommon', plan: 'porous', artSeed: 30884, pitch: 'Low',
      baseStats: { vigor: 77, focus: 68, guard: 50, spirit: 67, edge: 40, tempo: 52 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1.4, Gloom: 1, Biteroot: 1, Rivet: 0.75, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'gust-thread'],
      flavor: 'A porous body that keeps a Cindersong hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'pellnyxmelt', name: 'Pellnyxmelt', primary: 'Brine', secondary: null,
      rarity: 'common', plan: 'colonial', artSeed: 30981, pitch: 'Mid',
      baseStats: { vigor: 78, focus: 71, guard: 55, spirit: 74, edge: 44, tempo: 58 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1.4, Biteroot: 1, Rivet: 1, Spark: 0.75, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'veil-shear'],
      flavor: 'A colonial body that keeps a Brine hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'gravoruslab', name: 'Gravoruslab', primary: 'Stratum', secondary: null,
      rarity: 'common', plan: 'crystalline', artSeed: 31078, pitch: 'High',
      baseStats: { vigor: 79, focus: 74, guard: 60, spirit: 81, edge: 48, tempo: 64 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1.4, Rivet: 1, Spark: 1, Bile: 0.75 },
      learnset: ['hush-ember', 'flare-lattice', 'veil-rush'],
      flavor: 'A crystalline body that keeps a Stratum hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'ulmoskveil', name: 'Ulmoskveil', primary: 'Draft', secondary: null,
      rarity: 'uncommon', plan: 'orbiting', artSeed: 31175, pitch: 'Low',
      baseStats: { vigor: 80, focus: 77, guard: 65, spirit: 48, edge: 52, tempo: 34 },
      baseWard: { Cindersong: 0.75, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1.4, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'draft-needle'],
      flavor: 'A orbiting body that keeps a Draft hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'oskkaruhollow', name: 'Oskkaruhollow', primary: 'Gloom', secondary: null,
      rarity: 'common', plan: 'tidal', artSeed: 31272, pitch: 'Mid',
      baseStats: { vigor: 81, focus: 43, guard: 70, spirit: 55, edge: 56, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 0.75, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1.4, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'dusk-whisper'],
      flavor: 'A tidal body that keeps a Gloom hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'wyntalfrond', name: 'Wyntalfrond', primary: 'Biteroot', secondary: null,
      rarity: 'rare', plan: 'laminar', artSeed: 31369, pitch: 'High',
      baseStats: { vigor: 82, focus: 46, guard: 41, spirit: 62, edge: 60, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 0.75, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1.4 },
      learnset: ['hush-ember', 'flare-lattice', 'shade-fold'],
      flavor: 'A laminar body that keeps a Biteroot hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'ulmsevbolt', name: 'Ulmsevbolt', primary: 'Rivet', secondary: null,
      rarity: 'uncommon', plan: 'geomorphic', artSeed: 31466, pitch: 'Low',
      baseStats: { vigor: 83, focus: 49, guard: 46, spirit: 69, edge: 64, tempo: 52 },
      baseWard: { Cindersong: 1.4, Brine: 1, Stratum: 1, Draft: 0.75, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'hollow-chord'],
      flavor: 'A geomorphic body that keeps a Rivet hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'zephulmflick', name: 'Zephulmflick', primary: 'Spark', secondary: null,
      rarity: 'common', plan: 'lattice', artSeed: 31563, pitch: 'Mid',
      baseStats: { vigor: 84, focus: 52, guard: 51, spirit: 76, edge: 36, tempo: 58 },
      baseWard: { Cindersong: 1, Brine: 1.4, Stratum: 1, Draft: 1, Gloom: 0.75, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'dusk-ring'],
      flavor: 'A lattice body that keeps a Spark hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'myrrodelblight', name: 'Myrrodelblight', primary: 'Bile', secondary: null,
      rarity: 'common', plan: 'filament', artSeed: 31660, pitch: 'High',
      baseStats: { vigor: 85, focus: 55, guard: 56, spirit: 83, edge: 40, tempo: 64 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1.4, Draft: 1, Gloom: 1, Biteroot: 0.75, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'thorn-lull'],
      flavor: 'A filament body that keeps a Bile hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'quinkalember', name: 'Quinkalember', primary: 'Cindersong', secondary: null,
      rarity: 'uncommon', plan: 'coiled', artSeed: 31757, pitch: 'Low',
      baseStats: { vigor: 86, focus: 58, guard: 61, spirit: 50, edge: 44, tempo: 34 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1.4, Gloom: 1, Biteroot: 1, Rivet: 0.75, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'bloom-latch'],
      flavor: 'A coiled body that keeps a Cindersong hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'karugravmelt', name: 'Karugravmelt', primary: 'Brine', secondary: null,
      rarity: 'common', plan: 'bloom', artSeed: 31854, pitch: 'Mid',
      baseStats: { vigor: 68, focus: 61, guard: 66, spirit: 57, edge: 48, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1.4, Biteroot: 1, Rivet: 1, Spark: 0.75, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'frond-rake'],
      flavor: 'A bloom body that keeps a Brine hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'solmquinslab', name: 'Solmquinslab', primary: 'Stratum', secondary: null,
      rarity: 'common', plan: 'porous', artSeed: 31951, pitch: 'High',
      baseStats: { vigor: 69, focus: 64, guard: 71, spirit: 64, edge: 52, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1.4, Rivet: 1, Spark: 1, Bile: 0.75 },
      learnset: ['hush-ember', 'flare-lattice', 'thorn-bind'],
      flavor: 'A porous body that keeps a Stratum hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'virebringust', name: 'Virebringust', primary: 'Draft', secondary: null,
      rarity: 'rare', plan: 'colonial', artSeed: 32048, pitch: 'Low',
      baseStats: { vigor: 70, focus: 67, guard: 42, spirit: 71, edge: 56, tempo: 52 },
      baseWard: { Cindersong: 0.75, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1.4, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'bolt-hum'],
      flavor: 'A colonial body that keeps a Draft hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'odellumhollow', name: 'Odellumhollow', primary: 'Gloom', secondary: null,
      rarity: 'common', plan: 'crystalline', artSeed: 32145, pitch: 'Mid',
      baseStats: { vigor: 71, focus: 70, guard: 47, spirit: 78, edge: 60, tempo: 58 },
      baseWard: { Cindersong: 1, Brine: 0.75, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1.4, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'rivet-press'],
      flavor: 'A crystalline body that keeps a Gloom hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'nyxwynfrond', name: 'Nyxwynfrond', primary: 'Biteroot', secondary: null,
      rarity: 'common', plan: 'orbiting', artSeed: 32242, pitch: 'High',
      baseStats: { vigor: 72, focus: 73, guard: 52, spirit: 45, edge: 64, tempo: 64 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 0.75, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1.4 },
      learnset: ['hush-ember', 'flare-lattice', 'anvil-chord'],
      flavor: 'A orbiting body that keeps a Biteroot hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'thurvirebolt', name: 'Thurvirebolt', primary: 'Rivet', secondary: null,
      rarity: 'uncommon', plan: 'tidal', artSeed: 32339, pitch: 'Low',
      baseStats: { vigor: 75, focus: 76, guard: 57, spirit: 52, edge: 36, tempo: 34 },
      baseWard: { Cindersong: 1.4, Brine: 1, Stratum: 1, Draft: 0.75, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'bolt-shear'],
      flavor: 'A tidal body that keeps a Rivet hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'brinveshflick', name: 'Brinveshflick', primary: 'Spark', secondary: null,
      rarity: 'common', plan: 'laminar', artSeed: 32436, pitch: 'Mid',
      baseStats: { vigor: 87, focus: 42, guard: 62, spirit: 59, edge: 40, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 1.4, Stratum: 1, Draft: 1, Gloom: 0.75, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'arc-hum'],
      flavor: 'A laminar body that keeps a Spark hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'talpellblight', name: 'Talpellblight', primary: 'Bile', secondary: null,
      rarity: 'common', plan: 'geomorphic', artSeed: 32533, pitch: 'High',
      baseStats: { vigor: 75, focus: 45, guard: 67, spirit: 66, edge: 44, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1.4, Draft: 1, Gloom: 1, Biteroot: 0.75, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'flick-lane'],
      flavor: 'A geomorphic body that keeps a Bile hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'mormyrrember', name: 'Mormyrrember', primary: 'Cindersong', secondary: null,
      rarity: 'uncommon', plan: 'lattice', artSeed: 32630, pitch: 'Low',
      baseStats: { vigor: 76, focus: 48, guard: 72, spirit: 73, edge: 48, tempo: 52 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1.4, Gloom: 1, Biteroot: 1, Rivet: 0.75, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'charge-crown'],
      flavor: 'A lattice body that keeps a Cindersong hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'veshthurmelt', name: 'Veshthurmelt', primary: 'Brine', secondary: null,
      rarity: 'rare', plan: 'filament', artSeed: 32727, pitch: 'Mid',
      baseStats: { vigor: 77, focus: 51, guard: 43, spirit: 80, edge: 52, tempo: 58 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1.4, Biteroot: 1, Rivet: 1, Spark: 0.75, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'arc-needle'],
      flavor: 'A filament body that keeps a Brine hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'kaldrayslab', name: 'Kaldrayslab', primary: 'Stratum', secondary: null,
      rarity: 'common', plan: 'coiled', artSeed: 32824, pitch: 'High',
      baseStats: { vigor: 78, focus: 54, guard: 48, spirit: 47, edge: 56, tempo: 64 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1.4, Rivet: 1, Spark: 1, Bile: 0.75 },
      learnset: ['hush-ember', 'flare-lattice', 'spore-hum'],
      flavor: 'A coiled body that keeps a Stratum hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'oruoskgust', name: 'Oruoskgust', primary: 'Draft', secondary: null,
      rarity: 'uncommon', plan: 'bloom', artSeed: 32921, pitch: 'Low',
      baseStats: { vigor: 79, focus: 57, guard: 53, spirit: 54, edge: 60, tempo: 34 },
      baseWard: { Cindersong: 0.75, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1.4, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'blight-seep'],
      flavor: 'A bloom body that keeps a Draft hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'draysolmhollow', name: 'Draysolmhollow', primary: 'Gloom', secondary: null,
      rarity: 'common', plan: 'porous', artSeed: 33018, pitch: 'Mid',
      baseStats: { vigor: 80, focus: 60, guard: 58, spirit: 61, edge: 64, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 0.75, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1.4, Bile: 1 },
      learnset: ['hush-ember', 'flare-lattice', 'venom-thread'],
      flavor: 'A porous body that keeps a Gloom hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'lummorfrond', name: 'Lummorfrond', primary: 'Biteroot', secondary: null,
      rarity: 'common', plan: 'colonial', artSeed: 33115, pitch: 'High',
      baseStats: { vigor: 81, focus: 63, guard: 63, spirit: 68, edge: 36, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 0.75, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1.4 },
      learnset: ['hush-ember', 'flare-lattice', 'spore-ring'],
      flavor: 'A colonial body that keeps a Biteroot hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'sevnixabolt', name: 'Sevnixabolt', primary: 'Rivet', secondary: null,
      rarity: 'uncommon', plan: 'crystalline', artSeed: 33212, pitch: 'Low',
      baseStats: { vigor: 82, focus: 66, guard: 68, spirit: 75, edge: 40, tempo: 52 },
      baseWard: { Cindersong: 1.4, Brine: 1, Stratum: 1, Draft: 0.75, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'ember-ring'],
      flavor: 'A crystalline body that keeps a Rivet hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'nixazephflick', name: 'Nixazephflick', primary: 'Spark', secondary: null,
      rarity: 'common', plan: 'orbiting', artSeed: 33309, pitch: 'Mid',
      baseStats: { vigor: 83, focus: 69, guard: 39, spirit: 82, edge: 44, tempo: 58 },
      baseWard: { Cindersong: 1, Brine: 1.4, Stratum: 1, Draft: 1, Gloom: 0.75, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'tide-murmur'],
      flavor: 'A orbiting body that keeps a Spark hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'pellnyxblight', name: 'Pellnyxblight', primary: 'Bile', secondary: null,
      rarity: 'rare', plan: 'tidal', artSeed: 33406, pitch: 'High',
      baseStats: { vigor: 84, focus: 72, guard: 44, spirit: 49, edge: 48, tempo: 64 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1.4, Draft: 1, Gloom: 1, Biteroot: 0.75, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'melt-ribbon'],
      flavor: 'A tidal body that keeps a Bile hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'gravoruember', name: 'Gravoruember', primary: 'Cindersong', secondary: null,
      rarity: 'uncommon', plan: 'laminar', artSeed: 33503, pitch: 'Low',
      baseStats: { vigor: 85, focus: 75, guard: 49, spirit: 56, edge: 52, tempo: 34 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1.4, Gloom: 1, Biteroot: 1, Rivet: 0.75, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'drown-glass'],
      flavor: 'A laminar body that keeps a Cindersong hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'ulmoskdrown', name: 'Ulmoskdrown', primary: 'Brine', secondary: null,
      rarity: 'common', plan: 'geomorphic', artSeed: 33600, pitch: 'Mid',
      baseStats: { vigor: 86, focus: 41, guard: 54, spirit: 63, edge: 56, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1.4, Biteroot: 1, Rivet: 1, Spark: 0.75, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'brine-lens'],
      flavor: 'A geomorphic body that keeps a Brine hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'oskkaruslab', name: 'Oskkaruslab', primary: 'Stratum', secondary: null,
      rarity: 'common', plan: 'lattice', artSeed: 33697, pitch: 'High',
      baseStats: { vigor: 68, focus: 44, guard: 59, spirit: 70, edge: 60, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1.4, Rivet: 1, Spark: 1, Bile: 0.75 },
      learnset: ['hush-ember', 'coal-spiral', 'crag-hum'],
      flavor: 'A lattice body that keeps a Stratum hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'wyntalgust', name: 'Wyntalgust', primary: 'Draft', secondary: null,
      rarity: 'uncommon', plan: 'filament', artSeed: 33794, pitch: 'Low',
      baseStats: { vigor: 69, focus: 47, guard: 64, spirit: 77, edge: 64, tempo: 52 },
      baseWard: { Cindersong: 0.75, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1.4, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'slab-press'],
      flavor: 'A filament body that keeps a Draft hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'ulmsevhollow', name: 'Ulmsevhollow', primary: 'Gloom', secondary: null,
      rarity: 'common', plan: 'coiled', artSeed: 33891, pitch: 'Mid',
      baseStats: { vigor: 73, focus: 50, guard: 69, spirit: 44, edge: 36, tempo: 58 },
      baseWard: { Cindersong: 1, Brine: 0.75, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1.4, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'stone-choir'],
      flavor: 'A coiled body that keeps a Gloom hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'zephulmfrond', name: 'Zephulmfrond', primary: 'Biteroot', secondary: null,
      rarity: 'common', plan: 'bloom', artSeed: 33988, pitch: 'High',
      baseStats: { vigor: 82, focus: 53, guard: 40, spirit: 51, edge: 40, tempo: 64 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 0.75, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1.4 },
      learnset: ['hush-ember', 'coal-spiral', 'crag-bind'],
      flavor: 'A bloom body that keeps a Biteroot hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'myrrodelbolt', name: 'Myrrodelbolt', primary: 'Rivet', secondary: null,
      rarity: 'rare', plan: 'porous', artSeed: 34085, pitch: 'Low',
      baseStats: { vigor: 93, focus: 56, guard: 45, spirit: 58, edge: 44, tempo: 34 },
      baseWard: { Cindersong: 1.4, Brine: 1, Stratum: 1, Draft: 0.75, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'gust-thread'],
      flavor: 'A porous body that keeps a Rivet hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'quinkalflick', name: 'Quinkalflick', primary: 'Spark', secondary: null,
      rarity: 'common', plan: 'colonial', artSeed: 34182, pitch: 'Mid',
      baseStats: { vigor: 73, focus: 59, guard: 50, spirit: 65, edge: 48, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 1.4, Stratum: 1, Draft: 1, Gloom: 0.75, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'veil-shear'],
      flavor: 'A colonial body that keeps a Spark hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'karugravblight', name: 'Karugravblight', primary: 'Bile', secondary: null,
      rarity: 'common', plan: 'crystalline', artSeed: 34279, pitch: 'High',
      baseStats: { vigor: 74, focus: 62, guard: 55, spirit: 72, edge: 52, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1.4, Draft: 1, Gloom: 1, Biteroot: 0.75, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'veil-rush'],
      flavor: 'A crystalline body that keeps a Bile hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'solmquinember', name: 'Solmquinember', primary: 'Cindersong', secondary: null,
      rarity: 'uncommon', plan: 'orbiting', artSeed: 34376, pitch: 'Low',
      baseStats: { vigor: 75, focus: 65, guard: 60, spirit: 79, edge: 56, tempo: 52 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1.4, Gloom: 1, Biteroot: 1, Rivet: 0.75, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'draft-needle'],
      flavor: 'A orbiting body that keeps a Cindersong hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'virebrinmelt', name: 'Virebrinmelt', primary: 'Brine', secondary: null,
      rarity: 'common', plan: 'tidal', artSeed: 34473, pitch: 'Mid',
      baseStats: { vigor: 76, focus: 68, guard: 65, spirit: 46, edge: 60, tempo: 58 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1.4, Biteroot: 1, Rivet: 1, Spark: 0.75, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'dusk-whisper'],
      flavor: 'A tidal body that keeps a Brine hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'odellumslab', name: 'Odellumslab', primary: 'Stratum', secondary: null,
      rarity: 'common', plan: 'laminar', artSeed: 34570, pitch: 'High',
      baseStats: { vigor: 77, focus: 71, guard: 70, spirit: 53, edge: 64, tempo: 64 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1.4, Rivet: 1, Spark: 1, Bile: 0.75 },
      learnset: ['hush-ember', 'coal-spiral', 'shade-fold'],
      flavor: 'A laminar body that keeps a Stratum hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'nyxwyngust', name: 'Nyxwyngust', primary: 'Draft', secondary: null,
      rarity: 'uncommon', plan: 'geomorphic', artSeed: 34667, pitch: 'Low',
      baseStats: { vigor: 85, focus: 74, guard: 41, spirit: 60, edge: 36, tempo: 34 },
      baseWard: { Cindersong: 0.75, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1.4, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'hollow-chord'],
      flavor: 'A geomorphic body that keeps a Draft hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'thurvirehollow', name: 'Thurvirehollow', primary: 'Gloom', secondary: null,
      rarity: 'rare', plan: 'lattice', artSeed: 34764, pitch: 'Mid',
      baseStats: { vigor: 79, focus: 77, guard: 46, spirit: 67, edge: 40, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 0.75, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1.4, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'dusk-ring'],
      flavor: 'A lattice body that keeps a Gloom hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'brinveshfrond', name: 'Brinveshfrond', primary: 'Biteroot', secondary: null,
      rarity: 'common', plan: 'filament', artSeed: 34861, pitch: 'High',
      baseStats: { vigor: 80, focus: 43, guard: 51, spirit: 74, edge: 44, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 0.75, Draft: 1, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1.4 },
      learnset: ['hush-ember', 'coal-spiral', 'thorn-lull'],
      flavor: 'A filament body that keeps a Biteroot hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'talpellbolt', name: 'Talpellbolt', primary: 'Rivet', secondary: null,
      rarity: 'uncommon', plan: 'coiled', artSeed: 34958, pitch: 'Low',
      baseStats: { vigor: 81, focus: 46, guard: 56, spirit: 81, edge: 48, tempo: 52 },
      baseWard: { Cindersong: 1.4, Brine: 1, Stratum: 1, Draft: 0.75, Gloom: 1, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'bloom-latch'],
      flavor: 'A coiled body that keeps a Rivet hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'mormyrrflick', name: 'Mormyrrflick', primary: 'Spark', secondary: null,
      rarity: 'common', plan: 'bloom', artSeed: 35055, pitch: 'Mid',
      baseStats: { vigor: 82, focus: 49, guard: 61, spirit: 48, edge: 52, tempo: 58 },
      baseWard: { Cindersong: 1, Brine: 1.4, Stratum: 1, Draft: 1, Gloom: 0.75, Biteroot: 1, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'frond-rake'],
      flavor: 'A bloom body that keeps a Spark hum in the fen.',
      habitat: ['fen']
    },
    {
      id: 'veshthurblight', name: 'Veshthurblight', primary: 'Bile', secondary: null,
      rarity: 'common', plan: 'porous', artSeed: 35152, pitch: 'High',
      baseStats: { vigor: 83, focus: 52, guard: 66, spirit: 55, edge: 56, tempo: 64 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1.4, Draft: 1, Gloom: 1, Biteroot: 0.75, Rivet: 1, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'thorn-bind'],
      flavor: 'A porous body that keeps a Bile hum in the thorn.',
      habitat: ['thorn']
    },
    {
      id: 'kaldrayember', name: 'Kaldrayember', primary: 'Cindersong', secondary: null,
      rarity: 'uncommon', plan: 'colonial', artSeed: 35249, pitch: 'Low',
      baseStats: { vigor: 84, focus: 55, guard: 71, spirit: 62, edge: 60, tempo: 34 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1.4, Gloom: 1, Biteroot: 1, Rivet: 0.75, Spark: 1, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'bolt-hum'],
      flavor: 'A colonial body that keeps a Cindersong hum in the shelf.',
      habitat: ['shelf']
    },
    {
      id: 'oruoskmelt', name: 'Oruoskmelt', primary: 'Brine', secondary: null,
      rarity: 'common', plan: 'crystalline', artSeed: 35346, pitch: 'Mid',
      baseStats: { vigor: 85, focus: 58, guard: 42, spirit: 69, edge: 64, tempo: 40 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1.4, Biteroot: 1, Rivet: 1, Spark: 0.75, Bile: 1 },
      learnset: ['hush-ember', 'coal-spiral', 'rivet-press'],
      flavor: 'A crystalline body that keeps a Brine hum in the foundry.',
      habitat: ['foundry']
    },
    {
      id: 'draysolmslab', name: 'Draysolmslab', primary: 'Stratum', secondary: null,
      rarity: 'rare', plan: 'orbiting', artSeed: 35443, pitch: 'High',
      baseStats: { vigor: 86, focus: 61, guard: 47, spirit: 76, edge: 36, tempo: 46 },
      baseWard: { Cindersong: 1, Brine: 1, Stratum: 1, Draft: 1, Gloom: 1, Biteroot: 1.4, Rivet: 1, Spark: 1, Bile: 0.75 },
      learnset: ['hush-ember', 'coal-spiral', 'anvil-chord'],
      flavor: 'A orbiting body that keeps a Stratum hum in the fen.',
      habitat: ['fen']
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
    '#B..............rD.#',
    '####################'
  ];


  const FEN = [
    '####################',
    '#eH................#',
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
    '#B..............rD.#',
    '####################'
  ];

  const THORN = [
    '####################',
    '#e..............H..#',
    '#..gggggg..........#',
    '#..gggggg......N...#',
    '#..gggggg..........#',
    '#..................#',
    '#.........SSSS.....#',
    '#.........SSSS.....#',
    '#..................#',
    '#............gggg..#',
    '#............gggg..#',
    '#..................#',
    '#B..............rD.#',
    '####################'
  ];

  const SHELF = [
    '####################',
    '#eH................#',
    '#.....gggggg.......#',
    '#..N..gggggg.......#',
    '#.....gggggg.......#',
    '#..................#',
    '#............SSSS..#',
    '#............SSSS..#',
    '#..................#',
    '#gggg..............#',
    '#gggg..............#',
    '#..................#',
    '#B..............rD.#',
    '####################'
  ];

  const FOUNDRY = [
    '####################',
    '#e...............H.#',
    '#......gggggg......#',
    '#......gggggg..N...#',
    '#......gggggg......#',
    '#..................#',
    '#..SSSS............#',
    '#..SSSS............#',
    '#..................#',
    '#..........gggg....#',
    '#..........gggg....#',
    '#..................#',
    '#B..............rD.#',
    '####################'
  ];


  const CHORUS_HALL = [
    '####################',
    '#eH................#',
    '#@.................#',
    '#..................#',
    '#......gggg........#',
    '#........CC........#',
    '#........CC........#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#..................#',
    '#B.................#',
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
      links: { B: 'cut', D: 'fen' },
      levelMin: 12,
      levelMax: 15,
      encounters: ['myrrarc', 'sevflick', 'karuspore', 'vireblight', 'draygust'],
      map: RIDGE
    },
    fen: {
      id: 'fen',
      name: 'Gloom Fen',
      wardenId: 'ulm',
      links: { B: 'ridge', D: 'thorn' },
      levelMin: 14,
      levelMax: 16,
      encounters: ['brinveshember', 'kaldrayhollow', 'sevnixablight', 'ulmoskveil', 'zephulmflick', 'solmquinslab', 'thurvirebolt', 'veshthurmelt', 'lummorfrond', 'gravoruember', 'ulmsevhollow', 'karugravblight', 'nyxwyngust', 'mormyrrflick', 'draysolmslab'],
      map: FEN
    },
    thorn: {
      id: 'thorn',
      name: 'Biteroot Thorn',
      wardenId: 'zeph',
      links: { B: 'fen', D: 'shelf' },
      levelMin: 15,
      levelMax: 17,
      encounters: ['talpellmelt', 'oruoskfrond', 'nixazephember', 'oskkaruhollow', 'myrrodelblight', 'virebringust', 'brinveshflick', 'kaldrayslab', 'sevnixabolt', 'ulmoskdrown', 'zephulmfrond', 'solmquinember', 'thurvirehollow', 'veshthurblight'],
      map: THORN
    },
    shelf: {
      id: 'shelf',
      name: 'Draft Shelf',
      wardenId: 'karu',
      links: { B: 'thorn', D: 'foundry' },
      levelMin: 16,
      levelMax: 18,
      encounters: ['mormyrrslab', 'draysolmbolt', 'pellnyxmelt', 'wyntalfrond', 'quinkalember', 'odellumhollow', 'talpellblight', 'oruoskgust', 'nixazephflick', 'oskkaruslab', 'myrrodelbolt', 'virebrinmelt', 'brinveshfrond', 'kaldrayember'],
      map: SHELF
    },
    foundry: {
      id: 'foundry',
      name: 'Rivet Foundry',
      wardenId: 'tal',
      links: { B: 'shelf', D: 'chorus' },
      levelMin: 17,
      levelMax: 19,
      encounters: ['veshthurgust', 'lummorflick', 'gravoruslab', 'ulmsevbolt', 'karugravmelt', 'nyxwynfrond', 'mormyrrember', 'draysolmhollow', 'pellnyxblight', 'wyntalgust', 'quinkalflick', 'odellumslab', 'talpellbolt', 'oruoskmelt'],
      map: FOUNDRY
    },

    chorus: {
      id: 'chorus',
      name: 'Chorus Hall',
      wardenId: null,
      requiresChoir: true,
      links: { B: 'foundry' },
      levelMin: 18,
      levelMax: 19,
      encounters: ['kalflare', 'nyxshade', 'quinbolt', 'wynveil'],
      map: CHORUS_HALL
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
      win: 'Your own Harmonic held. The east gate opens onto the fen.',
      loss: 'A borrowed Harmonic dies in this room. Attune a voice whose own song matches, then return.',
      rules: { primaryLock: true },
      team: [
        { speciesId: 'myrrarc', level: 15 },
        { speciesId: 'sevflick', level: 16 },
        { speciesId: 'karuspore', level: 16 }
      ]
    },

    ulm: {
      id: 'ulm',
      name: 'Warden Ulm',
      sanctum: 'Sanctum of Gloom',
      intro: 'I keep the fen. Finish this phrase in eight beats. If the song is still open after that, the Sanctum closes on you.',
      win: 'Eight beats held. The thorn past the east gate asks for Kindling only.',
      loss: 'The phrase ran long. The fen does not grant extra beats. Rest and return.',
      rules: { phraseLimit: 8 },
      team: [
        { speciesId: 'brinveshember', level: 17 },
        { speciesId: 'kaldrayhollow', level: 18 }
      ]
    },
    zeph: {
      id: 'zeph',
      name: 'Warden Zeph',
      sanctum: 'Sanctum of Biteroot',
      intro: 'I keep the thorn. Only Kindling is heard here. A heavier Motif spends Cadence and does nothing.',
      win: 'Kindling was enough. The shelf will ask your Choir to trade voices.',
      loss: 'A heavy Motif dies in this room. Bring Kindling and return.',
      rules: { kindlingOnly: true },
      team: [
        { speciesId: 'talpellmelt', level: 17 },
        { speciesId: 'oruoskfrond', level: 18 }
      ]
    },
    karu: {
      id: 'karu',
      name: 'Warden Karu',
      sanctum: 'Sanctum of Draft',
      intro: 'I keep the shelf. After you sing, another living voice from the Choir must come forward. The same Resonant may not answer twice in a row.',
      win: 'You let the Choir trade. The foundry softens only the first phrase.',
      loss: 'One voice cannot hold this shelf. Keep two Resonants with Vigor and return.',
      rules: { rotate: true },
      team: [
        { speciesId: 'mormyrrslab', level: 18 },
        { speciesId: 'draysolmbolt', level: 18 }
      ]
    },
    tal: {
      id: 'tal',
      name: 'Warden Tal',
      sanctum: 'Sanctum of Rivet',
      intro: 'I keep the foundry. The first phrase lands softly. After that, the metal hears you in full.',
      win: 'The foundry is answered. Eight Sanctums have a record. The east gate opens onto the Chorus.',
      loss: 'The soft opening was not the whole phrase. Heal at the lamp and come back.',
      rules: { openingSoften: true },
      team: [
        { speciesId: 'veshthurgust', level: 18 },
        { speciesId: 'lummorflick', level: 19 }
      ]
    }
  };


  const CHORUS = [
    {
      id: 'voice-brin',
      name: 'Voice Brin',
      intro: 'I am the first voice of the Chorus. Heat and brine, in that order. Answer both.',
      team: [
        { speciesId: 'kalflare', level: 18 },
        { speciesId: 'orumelt', level: 18 }
      ]
    },
    {
      id: 'voice-nyx',
      name: 'Voice Nyx',
      intro: 'I am the second voice. The hall gets quieter here. Do not mistake quiet for mercy.',
      team: [
        { speciesId: 'nyxshade', level: 18 },
        { speciesId: 'nixadusk', level: 19 }
      ]
    },
    {
      id: 'voice-quin',
      name: 'Voice Quin',
      intro: 'I am the third voice. Metal keeps time. Miss the beat and the phrase closes on you.',
      team: [
        { speciesId: 'quinbolt', level: 19 },
        { speciesId: 'thurbolt', level: 19 }
      ]
    },
    {
      id: 'voice-zeph',
      name: 'Voice Zeph',
      intro: 'I am the fourth voice. After me, only the Prime Voice remains.',
      team: [
        { speciesId: 'wynveil', level: 19 },
        { speciesId: 'sevflick', level: 19 }
      ]
    }
  ];

  const PRIME_VOICE = {
    id: 'prime',
    name: 'Prime Voice',
    intro: [
      'The four voices step back. One figure remains, empty-handed, the same calm as the Conductor and not the same person.',
      'Prime Voice: I do not want the world silent. I want the last phrase to be chosen, not torn. If your Choir can outlast mine, the hall stays open.'
    ],
    win: 'The Prime Voice lets the note go. The Lumenfall is still torn, and the song is still here.',
    team: [
      { speciesId: 'tindflare', level: 19 },
      { speciesId: 'lumtide', level: 19 },
      { speciesId: 'oskslab', level: 19 }
    ]
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
    lossSlice: 'Your Choir falls silent. The survey is not over.',
    chorusShut: 'The Chorus stays shut until all eight Sanctums are answered.',
    chorusNext: 'That voice is quiet. The next one is on the dais.',
    chorusDone: 'The Chorus is answered. Speak at the dais for the Prime Voice.',
    endingDone: 'The hall is quiet. The song remains.',
    ending: [
      'Prime Voice: Then it is chosen. I will not still them.',
      'The Conductor is not in this hall. The fracture is still in the sky.',
      'Your Index holds what you recorded. The survey does not pretend the world is mended.'
    ]
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
    CHORUS: CHORUS,
    PRIME_VOICE: PRIME_VOICE,
    STRINGS: STRINGS,
    SAVE_SCHEMA_KEYS: SAVE_SCHEMA_KEYS,
    FIRST_RESONANCE: ['brinember', 'mortide', 'veshcrag']
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = AETHER;
  root.AETHER = AETHER;
})(typeof globalThis !== 'undefined' ? globalThis : this);
