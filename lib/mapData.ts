// Static geography for the interactive project map.
//
// City pixel coordinates are pre-projected (simple equirectangular
// projection scaled to `MAP_VIEW_BOX`) from real coordinates so the map
// stays a lightweight inline SVG with no runtime mapping library or tile
// fetches. A handful of city clusters that sit within a few kilometres of
// each other (Sari / Darzikola / Qaem Shahr) have their pins nudged apart
// by a few px so they don't overlap on screen.

export const MAP_VIEW_BOX = { width: 520, height: 478 };

// Simplified outline of Iran's national border.
export const IRAN_PATH_D =
  'M265.32,94 L287.71,88.16 L305.83,70.91 L322.87,71.78 L334.06,66.16 L352.18,68.94 L380.35,84.24 L400.7,87.54 L429.82,114.28 L448.82,115.36 L451.05,140.76 L440.67,178.37 L433.67,200.34 L444.76,204.79 L433.86,221.32 L442.21,245.42 L444.2,264.58 L463.5,269.67 L465.59,289.1 L442.48,316.47 L455.09,332.35 L465.35,350.58 L489.71,363.85 L490.41,390.44 L502.6,395.32 L504.71,409.23 L467.96,424.82 L458.35,459.89 L410.42,450.77 L382.64,443.84 L353.88,439.91 L343.01,402.9 L330.82,397.55 L311.24,402.94 L285.54,417.55 L254.4,407.54 L228.68,384.34 L204.14,375.74 L187.12,347.1 L168.32,306.86 L154.61,311.75 L138.42,301.74 L128.9,313.53 L114.8,297.66 L114.55,281.58 L106.41,281.59 L110.59,259.72 L97.48,236.78 L66.25,220.23 L48.6,191.54 L54.51,167.99 L67.34,157.57 L65.41,139.93 L48.7,130.87 L32.19,94.86 L18.26,70.68 L23.24,61.33 L15.29,26.71 L32.74,18.11 L36.78,29.5 L49.65,43.43 L67.13,47.45 L76.35,46.56 L106.4,24.29 L115.96,22.06 L123.49,30.92 L114.7,45.85 L130.59,61.66 L136.94,60.15 L145,82.41 L169.16,88.7 L186.86,103.85 L223.08,109.05 L262.88,101.06 L265.32,94 Z';

export type MapCityId =
  | 'tehran'
  | 'sanandaj'
  | 'bandar-abbas'
  | 'hormoz'
  | 'sari-village'
  | 'rasht'
  | 'yazd'
  | 'bojnourd'
  | 'mashhad'
  | 'bam'
  | 'darzikola'
  | 'qaem-shahr';

export const mapCities: Record<
  MapCityId,
  { name: string; nameFa: string; x: number; y: number }
> = {
  tehran: { name: 'Tehran', nameFa: 'تهران', x: 201.61, y: 139.25 },
  sanandaj: { name: 'Sanandaj', nameFa: 'سنندج', x: 88.6, y: 150.67 },
  'bandar-abbas': {
    name: 'Bandar Abbas',
    nameFa: 'بندرعباس',
    x: 325.43,
    y: 396.25,
  },
  hormoz: { name: 'Hormoz Island', nameFa: 'جزیره‌ی هرمز', x: 340, y: 414 },
  'sari-village': {
    name: 'Taleghani Mahalleh, Sari',
    nameFa: 'طالقانی‌محله، ساری',
    x: 230,
    y: 106,
  },
  rasht: { name: 'Rasht', nameFa: 'رشت', x: 154.77, y: 91.53 },
  yazd: { name: 'Yazd', nameFa: 'یزد', x: 276.41, y: 254.04 },
  bojnourd: { name: 'Bojnourd', nameFa: 'بجنورد', x: 352.14, y: 85.68 },
  mashhad: { name: 'Mashhad', nameFa: 'مشهد', x: 410.44, y: 122.33 },
  bam: { name: 'Bam', nameFa: 'بم', x: 378.34, y: 338.35 },
  darzikola: { name: 'Darzikola', nameFa: 'درزی‌کلا', x: 219, y: 120 },
  'qaem-shahr': {
    name: 'Qaem Shahr',
    nameFa: 'قائم‌شهر',
    x: 246,
    y: 122,
  },
};

/**
 * Ordered list of cities each project's location text refers to, following
 * the sequence in which the project moved through them. Projects held
 * online with no physical site (`from-afar-i-kiss-you`, `radio-khiaban`)
 * are intentionally omitted.
 */
export const projectCityLinks: Record<string, MapCityId[]> = {
  'an-experience-in-tir': ['tehran'],
  'book-reading-in-sanandaj-park': ['sanandaj'],
  'cafe-konj-performances': ['tehran'],
  daab: ['tehran'],
  'enghelab-azadi': ['tehran'],
  'an-equivalence-of-our-distance': ['tehran'],
  'mapping-karimkhan': ['tehran'],
  'knockout-tournament-ping-pong': ['tehran'],
  owzar: ['hormoz'],
  'paint-your-shadow-orange': [
    'sari-village',
    'tehran',
    'rasht',
    'qaem-shahr',
  ],
  paper: ['tehran'],
  'post-onion': ['bandar-abbas'],
  'printing-machine-dastgah-e-chap': ['rasht', 'tehran'],
  stones: ['tehran'],
  'talk-see-taxi-project': ['bojnourd', 'mashhad', 'tehran'],
  'tehran-monoxide': ['tehran', 'bam', 'darzikola'],
  'the-secret-of-laleh': ['tehran'],
  'white-cubes': ['yazd'],
  'workers-dont-go-to-the-factory': ['tehran'],
};

export const onlineProjectSlugs = ['from-afar-i-kiss-you', 'radio-khiaban'];

/**
 * Every city pin connected into a single web (a minimum spanning tree over
 * pin positions), drawn as a faint constant backdrop on the map so all of
 * the repository's locations read as one connected network rather than
 * scattered points. Distinct from `projectCityLinks`, which traces the
 * actual, ordered route a single multi-location project took.
 */
export const CITY_NETWORK_EDGES: [MapCityId, MapCityId][] = (() => {
  const ids = Object.keys(mapCities) as MapCityId[];
  const visited = new Set<MapCityId>([ids[0]]);
  const edges: [MapCityId, MapCityId][] = [];

  while (visited.size < ids.length) {
    let best: { from: MapCityId; to: MapCityId; dist: number } | null = null;

    for (const from of visited) {
      const fromCity = mapCities[from];

      for (const to of ids) {
        if (visited.has(to)) {
          continue;
        }

        const toCity = mapCities[to];
        const dist = Math.hypot(fromCity.x - toCity.x, fromCity.y - toCity.y);

        if (!best || dist < best.dist) {
          best = { from, to, dist };
        }
      }
    }

    if (!best) {
      break;
    }

    visited.add(best.to);
    edges.push([best.from, best.to]);
  }

  return edges;
})();
