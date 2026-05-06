// Hand-placed parcels around the University Ave Caltrain station.
// Coordinates match the SVG viewBox 800x540 in game.html.
// Station center: (155, 270). Rings: adjacent r=40, ¼ mi r=170, ½ mi r=320.
// `ring` is hand-classified (not auto-derived) so the game stays narratively coherent.
//
// `options.units` is the resulting *total* units on the parcel after the build.
// Net new units = options.units - currentUnits.
//
// Sum of "max" net-new units ≈ 1,664, matching the city's 1,600 / 25-yr estimate
// for the downtown station area. Picking "midrise" everywhere reaches ~1,000 net new.

export const PARCELS = [
  // ---- ADJACENT (within ~200 ft of station) ----
  {
    id: 'caltrain-north',
    name: 'Caltrain North Lot',
    blurb: 'Surface parking immediately north of the platform — public-transit-agency land.',
    x: 130, y: 200, w: 60, h: 50,
    ring: 'adjacent',
    currentLabel: 'Surface parking',
    currentStories: 0,
    currentUnits: 0,
    lotAreaSqft: 38000,
    options: [
      { key: 'stay',    label: 'Keep as parking',         stories: 0,  units: 0,   mixedUse: false },
      { key: 'midrise', label: '6-story mixed-use',       stories: 6,  units: 160, mixedUse: true  },
      { key: 'max',     label: '10-story tower w/ retail', stories: 10, units: 280, mixedUse: true  },
    ],
  },
  {
    id: 'caltrain-south',
    name: 'Caltrain South Lot',
    blurb: 'Surface parking immediately south of the platform.',
    x: 130, y: 295, w: 60, h: 50,
    ring: 'adjacent',
    currentLabel: 'Surface parking',
    currentStories: 0,
    currentUnits: 0,
    lotAreaSqft: 32000,
    options: [
      { key: 'stay',    label: 'Keep as parking',          stories: 0, units: 0,   mixedUse: false },
      { key: 'midrise', label: '5-story residential',      stories: 5, units: 130, mixedUse: false },
      { key: 'max',     label: '9-story affordable tower', stories: 9, units: 240, mixedUse: true  },
    ],
  },

  // ---- WITHIN ¼ MILE ----
  {
    id: 'alma-strip',
    name: 'Alma Surface Lot',
    blurb: 'Privately-owned surface parking along Alma between Lytton and University.',
    x: 215, y: 210, w: 50, h: 50,
    ring: 'quarter',
    currentLabel: 'Surface parking',
    currentStories: 0,
    currentUnits: 0,
    lotAreaSqft: 18000,
    options: [
      { key: 'stay',    label: 'Keep as parking',     stories: 0, units: 0,   mixedUse: false },
      { key: 'midrise', label: '4-story apartments',  stories: 4, units: 65,  mixedUse: false },
      { key: 'max',     label: '7-story mixed-use',   stories: 7, units: 100, mixedUse: true  },
    ],
  },
  {
    id: 'lytton-plaza',
    name: 'Lytton Plaza Block',
    blurb: 'Single-story retail strip with parking. Easy to assemble.',
    x: 285, y: 210, w: 95, h: 50,
    ring: 'quarter',
    currentLabel: '1-story retail',
    currentStories: 1,
    currentUnits: 0,
    lotAreaSqft: 26000,
    options: [
      { key: 'stay',    label: 'Keep as 1-story retail', stories: 1, units: 0,   mixedUse: true  },
      { key: 'midrise', label: '5-story mixed-use',      stories: 5, units: 90,  mixedUse: true  },
      { key: 'max',     label: '7-story mixed-use',      stories: 7, units: 140, mixedUse: true  },
    ],
  },
  {
    id: 'four-eleven-univ',
    name: '411 University Block',
    blurb: 'Two-story retail-and-office along University Ave with some upper-floor housing.',
    x: 215, y: 275, w: 70, h: 50,
    ring: 'quarter',
    currentLabel: '2-story retail',
    currentStories: 2,
    currentUnits: 8,
    lotAreaSqft: 15000,
    options: [
      { key: 'stay',    label: 'Keep at 2 stories', stories: 2, units: 8,  mixedUse: true },
      { key: 'midrise', label: '5-story mixed-use', stories: 5, units: 55, mixedUse: true },
      { key: 'max',     label: '7-story mixed-use', stories: 7, units: 85, mixedUse: true },
    ],
  },
  {
    id: 'univ-east',
    name: 'University Ave East Block',
    blurb: 'Single-story retail along University Ave east of Bryant.',
    x: 305, y: 275, w: 90, h: 50,
    ring: 'quarter',
    currentLabel: '1-story retail',
    currentStories: 1,
    currentUnits: 0,
    lotAreaSqft: 18000,
    options: [
      { key: 'stay',    label: 'Keep as 1-story retail', stories: 1, units: 0,  mixedUse: true },
      { key: 'midrise', label: '5-story mixed-use',      stories: 5, units: 60, mixedUse: true },
      { key: 'max',     label: '7-story mixed-use',      stories: 7, units: 95, mixedUse: true },
    ],
  },
  {
    id: 'hamilton-mid',
    name: 'Hamilton Mid Block',
    blurb: 'Two-story office, modest condition.',
    x: 215, y: 345, w: 70, h: 45,
    ring: 'quarter',
    currentLabel: '2-story office',
    currentStories: 2,
    currentUnits: 0,
    lotAreaSqft: 14000,
    options: [
      { key: 'stay',    label: 'Keep as office',     stories: 2, units: 0,  mixedUse: false },
      { key: 'midrise', label: '4-story apartments', stories: 4, units: 70, mixedUse: false },
      { key: 'max',     label: '7-story mixed-use',  stories: 7, units: 110, mixedUse: true },
    ],
  },
  {
    id: 'ramona-strip',
    name: 'Ramona Strip',
    blurb: 'Aging single-story retail with rear surface parking.',
    x: 305, y: 345, w: 90, h: 45,
    ring: 'quarter',
    currentLabel: '1-story retail',
    currentStories: 1,
    currentUnits: 0,
    lotAreaSqft: 16000,
    options: [
      { key: 'stay',    label: 'Keep as 1-story retail', stories: 1, units: 0,  mixedUse: true },
      { key: 'midrise', label: '5-story mixed-use',      stories: 5, units: 80, mixedUse: true },
      { key: 'max',     label: '7-story mixed-use',      stories: 7, units: 120, mixedUse: true },
    ],
  },
  {
    id: 'high-cottages',
    name: 'High Street Cottages',
    blurb: 'Cluster of small bungalows currently used as offices.',
    x: 215, y: 405, w: 70, h: 50,
    ring: 'quarter',
    currentLabel: 'SFH cluster',
    currentStories: 1,
    currentUnits: 6,
    lotAreaSqft: 14000,
    options: [
      { key: 'stay',    label: 'Keep as cottages',          stories: 1, units: 6,  mixedUse: false },
      { key: 'midrise', label: '4-story townhomes',         stories: 4, units: 50, mixedUse: false },
      { key: 'max',     label: '7-story apartments',        stories: 7, units: 80, mixedUse: false },
    ],
  },
  {
    id: 'bryant-office',
    name: 'Bryant 2-story Office',
    blurb: '1980s office building. End-of-life HVAC, prime redev candidate.',
    x: 305, y: 405, w: 90, h: 50,
    ring: 'quarter',
    currentLabel: '2-story office',
    currentStories: 2,
    currentUnits: 0,
    lotAreaSqft: 17000,
    options: [
      { key: 'stay',    label: 'Keep as office',     stories: 2, units: 0,   mixedUse: false },
      { key: 'midrise', label: '5-story apartments', stories: 5, units: 70,  mixedUse: false },
      { key: 'max',     label: '7-story mixed-use',  stories: 7, units: 105, mixedUse: true  },
    ],
  },

  // ---- WITHIN ½ MILE ----
  {
    id: 'forest-corner',
    name: 'Forest @ Bryant',
    blurb: 'Mid-block office tucked against Forest Ave. Just inside the half-mile band.',
    x: 405, y: 200, w: 75, h: 90,
    ring: 'half',
    currentLabel: '2-story office',
    currentStories: 2,
    currentUnits: 0,
    lotAreaSqft: 18000,
    options: [
      { key: 'stay',    label: 'Keep as office',     stories: 2, units: 0,  mixedUse: false },
      { key: 'midrise', label: '4-story apartments', stories: 4, units: 50, mixedUse: false },
      { key: 'max',     label: '5-story apartments', stories: 5, units: 80, mixedUse: false },
    ],
  },
  {
    id: 'cowper-cluster',
    name: 'Cowper SFH Cluster',
    blurb: 'Pocket of single-family homes converted to small offices.',
    x: 405, y: 305, w: 75, h: 90,
    ring: 'half',
    currentLabel: 'SFH cluster',
    currentStories: 1,
    currentUnits: 5,
    lotAreaSqft: 14000,
    options: [
      { key: 'stay',    label: 'Keep as SFH/office',  stories: 1, units: 5,  mixedUse: false },
      { key: 'midrise', label: '4-story townhomes',   stories: 4, units: 40, mixedUse: false },
      { key: 'max',     label: '5-story apartments',  stories: 5, units: 65, mixedUse: false },
    ],
  },
  {
    id: 'waverley-edge',
    name: 'Waverley Edge',
    blurb: 'Mixed retail and small apartments along Waverley.',
    x: 500, y: 200, w: 85, h: 195,
    ring: 'half',
    currentLabel: 'Mixed low-rise',
    currentStories: 2,
    currentUnits: 4,
    lotAreaSqft: 22000,
    options: [
      { key: 'stay',    label: 'Keep as-is',           stories: 2, units: 4,  mixedUse: true },
      { key: 'midrise', label: '4-story mixed-use',    stories: 4, units: 60, mixedUse: true },
      { key: 'max',     label: '5-story mixed-use',    stories: 5, units: 95, mixedUse: true },
    ],
  },
  {
    id: 'channing-edge',
    name: 'Channing SFH Edge',
    blurb: 'Edge of the half-mile band south of Forest. SFH neighborhood.',
    x: 195, y: 470, w: 285, h: 50,
    ring: 'half',
    currentLabel: 'SFH cluster',
    currentStories: 1,
    currentUnits: 8,
    lotAreaSqft: 32000,
    options: [
      { key: 'stay',    label: 'Keep as SFH',          stories: 1, units: 8,   mixedUse: false },
      { key: 'midrise', label: '4-story townhomes',    stories: 4, units: 60,  mixedUse: false },
      { key: 'max',     label: '5-story apartments',   stories: 5, units: 100, mixedUse: false },
    ],
  },
];

export const TARGET_NEW_UNITS = 1600; // matches Palo Alto staff's 25-yr estimate
