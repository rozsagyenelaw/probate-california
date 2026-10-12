// 35 city guide pages (the service covers all of California)
export const CITY_DATA = {
  'glendale': {
    name: 'Glendale',
    slug: 'glendale',
    county: 'Los Angeles',
    courthouse: 'Stanley Mosk Courthouse',
    courthouseAddress: '111 N. Hill Street, Los Angeles 90012',
    district: 'Central District',
    medianHome: '$1,200,000',
    medianHomeValue: 1200000,
    nearby: ['Burbank', 'Pasadena', 'Los Angeles'],
    nearbySlug: ['burbank', 'pasadena', 'los-angeles'],
    region: 'Los Angeles County'
  },
  'los-angeles': {
    name: 'Los Angeles',
    slug: 'los-angeles',
    county: 'Los Angeles',
    courthouse: 'Stanley Mosk Courthouse',
    courthouseAddress: '111 N. Hill Street, Los Angeles 90012',
    district: 'Central District',
    medianHome: '$950,000',
    medianHomeValue: 950000,
    nearby: ['Santa Monica', 'Glendale', 'Long Beach'],
    nearbySlug: ['santa-monica', 'glendale', 'long-beach'],
    region: 'Los Angeles County'
  },
  'burbank': {
    name: 'Burbank',
    slug: 'burbank',
    county: 'Los Angeles',
    courthouse: 'Stanley Mosk Courthouse',
    courthouseAddress: '111 N. Hill Street, Los Angeles 90012',
    district: 'Central District',
    medianHome: '$1,100,000',
    medianHomeValue: 1100000,
    nearby: ['Glendale', 'North Hollywood', 'Pasadena'],
    nearbySlug: ['glendale', 'pasadena'],
    region: 'Los Angeles County'
  },
  'pasadena': {
    name: 'Pasadena',
    slug: 'pasadena',
    county: 'Los Angeles',
    courthouse: 'Pasadena Courthouse',
    courthouseAddress: '300 E. Walnut Street, Pasadena 91101',
    district: 'Northeast District',
    medianHome: '$1,300,000',
    medianHomeValue: 1300000,
    nearby: ['Glendale', 'Altadena', 'Arcadia'],
    nearbySlug: ['glendale', 'burbank'],
    region: 'Los Angeles County'
  },
  'encino': {
    name: 'Encino',
    slug: 'encino',
    county: 'Los Angeles',
    courthouse: 'Van Nuys Courthouse East',
    courthouseAddress: '6230 Sylmar Avenue, Van Nuys 91401',
    district: 'Northwest District',
    medianHome: '$1,800,000',
    medianHomeValue: 1800000,
    nearby: ['Sherman Oaks', 'Tarzana', 'Woodland Hills'],
    nearbySlug: ['sherman-oaks', 'tarzana', 'woodland-hills'],
    region: 'San Fernando Valley'
  },
  'sherman-oaks': {
    name: 'Sherman Oaks',
    slug: 'sherman-oaks',
    county: 'Los Angeles',
    courthouse: 'Van Nuys Courthouse East',
    courthouseAddress: '6230 Sylmar Avenue, Van Nuys 91401',
    district: 'Northwest District',
    medianHome: '$1,500,000',
    medianHomeValue: 1500000,
    nearby: ['Encino', 'Studio City', 'Van Nuys'],
    nearbySlug: ['encino', 'tarzana', 'woodland-hills'],
    region: 'San Fernando Valley'
  },
  'woodland-hills': {
    name: 'Woodland Hills',
    slug: 'woodland-hills',
    county: 'Los Angeles',
    courthouse: 'Van Nuys Courthouse East',
    courthouseAddress: '6230 Sylmar Avenue, Van Nuys 91401',
    district: 'Northwest District',
    medianHome: '$1,200,000',
    medianHomeValue: 1200000,
    nearby: ['Calabasas', 'Tarzana', 'Canoga Park'],
    nearbySlug: ['calabasas', 'tarzana', 'encino'],
    region: 'San Fernando Valley'
  },
  'tarzana': {
    name: 'Tarzana',
    slug: 'tarzana',
    county: 'Los Angeles',
    courthouse: 'Van Nuys Courthouse East',
    courthouseAddress: '6230 Sylmar Avenue, Van Nuys 91401',
    district: 'Northwest District',
    medianHome: '$1,400,000',
    medianHomeValue: 1400000,
    nearby: ['Encino', 'Woodland Hills', 'Reseda'],
    nearbySlug: ['encino', 'woodland-hills', 'sherman-oaks'],
    region: 'San Fernando Valley'
  },
  'calabasas': {
    name: 'Calabasas',
    slug: 'calabasas',
    county: 'Los Angeles',
    courthouse: 'Van Nuys Courthouse East',
    courthouseAddress: '6230 Sylmar Avenue, Van Nuys 91401',
    district: 'Northwest District',
    medianHome: '$2,500,000',
    medianHomeValue: 2500000,
    nearby: ['Woodland Hills', 'Hidden Hills', 'Malibu'],
    nearbySlug: ['woodland-hills', 'tarzana', 'santa-monica'],
    region: 'San Fernando Valley'
  },
  'santa-monica': {
    name: 'Santa Monica',
    slug: 'santa-monica',
    county: 'Los Angeles',
    courthouse: 'Santa Monica Courthouse',
    courthouseAddress: '1725 Main Street, Santa Monica 90401',
    district: 'West District',
    medianHome: '$1,800,000',
    medianHomeValue: 1800000,
    nearby: ['Venice', 'Pacific Palisades', 'Brentwood'],
    nearbySlug: ['los-angeles', 'long-beach'],
    region: 'Los Angeles County'
  },
  'long-beach': {
    name: 'Long Beach',
    slug: 'long-beach',
    county: 'Los Angeles',
    courthouse: 'Governor George Deukmejian Courthouse',
    courthouseAddress: '275 Magnolia Avenue, Long Beach 90802',
    district: 'South District',
    medianHome: '$850,000',
    medianHomeValue: 850000,
    nearby: ['Lakewood', 'Signal Hill', 'Carson'],
    nearbySlug: ['los-angeles', 'santa-monica', 'anaheim'],
    region: 'Los Angeles County'
  },
  'santa-clarita': {
    name: 'Santa Clarita',
    slug: 'santa-clarita',
    county: 'Los Angeles',
    courthouse: 'Santa Clarita Courthouse',
    courthouseAddress: '23747 W. Valencia Boulevard, Santa Clarita 91355',
    district: 'North District',
    medianHome: '$750,000',
    medianHomeValue: 750000,
    nearby: ['Valencia', 'Newhall', 'Castaic'],
    nearbySlug: ['calabasas', 'woodland-hills'],
    region: 'Los Angeles County'
  },
  'anaheim': {
    name: 'Anaheim',
    slug: 'anaheim',
    county: 'Orange',
    courthouse: 'Lamoreaux Justice Center',
    courthouseAddress: '341 The City Drive South, Orange 92868',
    district: '',
    medianHome: '$850,000',
    medianHomeValue: 850000,
    nearby: ['Orange', 'Fullerton', 'Garden Grove'],
    nearbySlug: ['irvine', 'newport-beach', 'huntington-beach'],
    region: 'Orange County'
  },
  'irvine': {
    name: 'Irvine',
    slug: 'irvine',
    county: 'Orange',
    courthouse: 'Lamoreaux Justice Center',
    courthouseAddress: '341 The City Drive South, Orange 92868',
    district: '',
    medianHome: '$1,400,000',
    medianHomeValue: 1400000,
    nearby: ['Newport Beach', 'Tustin', 'Costa Mesa'],
    nearbySlug: ['newport-beach', 'anaheim', 'huntington-beach'],
    region: 'Orange County'
  },
  'newport-beach': {
    name: 'Newport Beach',
    slug: 'newport-beach',
    county: 'Orange',
    courthouse: 'Lamoreaux Justice Center',
    courthouseAddress: '341 The City Drive South, Orange 92868',
    district: '',
    medianHome: '$3,500,000',
    medianHomeValue: 3500000,
    nearby: ['Irvine', 'Corona del Mar', 'Laguna Beach'],
    nearbySlug: ['irvine', 'huntington-beach', 'anaheim'],
    region: 'Orange County'
  },
  'huntington-beach': {
    name: 'Huntington Beach',
    slug: 'huntington-beach',
    county: 'Orange',
    courthouse: 'Lamoreaux Justice Center',
    courthouseAddress: '341 The City Drive South, Orange 92868',
    district: '',
    medianHome: '$1,300,000',
    medianHomeValue: 1300000,
    nearby: ['Fountain Valley', 'Westminster', 'Seal Beach'],
    nearbySlug: ['irvine', 'newport-beach', 'anaheim'],
    region: 'Orange County'
  },
  'santa-barbara': {
    name: 'Santa Barbara',
    slug: 'santa-barbara',
    county: 'Santa Barbara',
    courthouse: 'Santa Barbara Courthouse',
    courthouseAddress: '1100 Anacapa Street, Santa Barbara 93101',
    district: '',
    medianHome: '$1,800,000',
    medianHomeValue: 1800000,
    nearby: ['Montecito', 'Goleta', 'Carpinteria'],
    nearbySlug: ['montecito', 'goleta', 'carpinteria'],
    region: 'Santa Barbara County'
  },
  'montecito': {
    name: 'Montecito',
    slug: 'montecito',
    county: 'Santa Barbara',
    courthouse: 'Santa Barbara Courthouse',
    courthouseAddress: '1100 Anacapa Street, Santa Barbara 93101',
    district: '',
    medianHome: '$5,000,000',
    medianHomeValue: 5000000,
    nearby: ['Santa Barbara', 'Summerland', 'Carpinteria'],
    nearbySlug: ['santa-barbara', 'carpinteria', 'goleta'],
    region: 'Santa Barbara County'
  },
  'goleta': {
    name: 'Goleta',
    slug: 'goleta',
    county: 'Santa Barbara',
    courthouse: 'Santa Barbara Courthouse',
    courthouseAddress: '1100 Anacapa Street, Santa Barbara 93101',
    district: '',
    medianHome: '$1,200,000',
    medianHomeValue: 1200000,
    nearby: ['Santa Barbara', 'Isla Vista', 'Gaviota'],
    nearbySlug: ['santa-barbara', 'isla-vista', 'carpinteria'],
    region: 'Santa Barbara County'
  },
  'carpinteria': {
    name: 'Carpinteria',
    slug: 'carpinteria',
    county: 'Santa Barbara',
    courthouse: 'Santa Barbara Courthouse',
    courthouseAddress: '1100 Anacapa Street, Santa Barbara 93101',
    district: '',
    medianHome: '$1,500,000',
    medianHomeValue: 1500000,
    nearby: ['Santa Barbara', 'Montecito', 'Ventura'],
    nearbySlug: ['santa-barbara', 'montecito', 'oxnard'],
    region: 'Santa Barbara County'
  },
  'isla-vista': {
    name: 'Isla Vista',
    slug: 'isla-vista',
    county: 'Santa Barbara',
    courthouse: 'Santa Barbara Courthouse',
    courthouseAddress: '1100 Anacapa Street, Santa Barbara 93101',
    district: '',
    medianHome: '$900,000',
    medianHomeValue: 900000,
    nearby: ['Goleta', 'Santa Barbara'],
    nearbySlug: ['goleta', 'santa-barbara'],
    region: 'Santa Barbara County'
  },
  'san-francisco': {
    name: 'San Francisco',
    slug: 'san-francisco',
    county: 'San Francisco',
    courthouse: 'Civic Center Courthouse',
    courthouseAddress: '400 McAllister Street, San Francisco 94102',
    district: '',
    medianHome: '$1,400,000',
    medianHomeValue: 1400000,
    nearby: ['Oakland', 'Daly City', 'Berkeley'],
    nearbySlug: ['oakland', 'fremont', 'san-jose'],
    region: 'Bay Area'
  },
  'san-jose': {
    name: 'San Jose',
    slug: 'san-jose',
    county: 'Santa Clara',
    courthouse: 'Downtown Superior Court',
    courthouseAddress: '191 N. First Street, San Jose 95113',
    district: '',
    medianHome: '$1,500,000',
    medianHomeValue: 1500000,
    nearby: ['Cupertino', 'Santa Clara', 'Sunnyvale'],
    nearbySlug: ['san-francisco', 'oakland', 'fremont'],
    region: 'Bay Area'
  },
  'oakland': {
    name: 'Oakland',
    slug: 'oakland',
    county: 'Alameda',
    courthouse: 'Rene C. Davidson Courthouse',
    courthouseAddress: '1225 Fallon Street, Oakland 94612',
    district: '',
    medianHome: '$850,000',
    medianHomeValue: 850000,
    nearby: ['Berkeley', 'Alameda', 'San Leandro'],
    nearbySlug: ['san-francisco', 'fremont', 'san-jose'],
    region: 'Bay Area'
  },
  'fremont': {
    name: 'Fremont',
    slug: 'fremont',
    county: 'Alameda',
    courthouse: 'Fremont Hall of Justice',
    courthouseAddress: '39439 Paseo Padre Parkway, Fremont 94538',
    district: '',
    medianHome: '$1,400,000',
    medianHomeValue: 1400000,
    nearby: ['Newark', 'Union City', 'Milpitas'],
    nearbySlug: ['oakland', 'san-jose', 'san-francisco'],
    region: 'Bay Area'
  },
  'san-diego': {
    name: 'San Diego',
    slug: 'san-diego',
    county: 'San Diego',
    courthouse: 'San Diego Central Courthouse',
    courthouseAddress: '1100 Union Street, San Diego 92101',
    district: '',
    medianHome: '$950,000',
    medianHomeValue: 950000,
    nearby: ['La Jolla', 'Chula Vista', 'Coronado'],
    nearbySlug: ['riverside', 'anaheim'],
    region: 'Other Regions'
  },
  'sacramento': {
    name: 'Sacramento',
    slug: 'sacramento',
    county: 'Sacramento',
    courthouse: 'William R. Ridgeway Courthouse',
    courthouseAddress: '3341 Power Inn Road, Sacramento 95826',
    district: '',
    medianHome: '$550,000',
    medianHomeValue: 550000,
    nearby: ['Elk Grove', 'Roseville', 'Folsom'],
    nearbySlug: ['stockton', 'modesto', 'fresno'],
    region: 'Other Regions'
  },
  'riverside': {
    name: 'Riverside',
    slug: 'riverside',
    county: 'Riverside',
    courthouse: 'Riverside Historic Courthouse',
    courthouseAddress: '4050 Main Street, Riverside 92501',
    district: '',
    medianHome: '$600,000',
    medianHomeValue: 600000,
    nearby: ['Moreno Valley', 'Corona', 'San Bernardino'],
    nearbySlug: ['moreno-valley', 'fontana', 'san-diego'],
    region: 'Other Regions'
  },
  'fresno': {
    name: 'Fresno',
    slug: 'fresno',
    county: 'Fresno',
    courthouse: 'Fresno County Courthouse',
    courthouseAddress: '1100 Van Ness Avenue, Fresno 93724',
    district: '',
    medianHome: '$400,000',
    medianHomeValue: 400000,
    nearby: ['Clovis', 'Madera', 'Visalia'],
    nearbySlug: ['bakersfield', 'modesto', 'stockton'],
    region: 'Other Regions'
  },
  'bakersfield': {
    name: 'Bakersfield',
    slug: 'bakersfield',
    county: 'Kern',
    courthouse: 'Kern County Superior Court',
    courthouseAddress: '1415 Truxtun Avenue, Bakersfield 93301',
    district: '',
    medianHome: '$400,000',
    medianHomeValue: 400000,
    nearby: ['Tehachapi', 'Delano', 'Taft'],
    nearbySlug: ['fresno', 'modesto'],
    region: 'Other Regions'
  },
  'stockton': {
    name: 'Stockton',
    slug: 'stockton',
    county: 'San Joaquin',
    courthouse: 'Stockton Courthouse',
    courthouseAddress: '180 E. Weber Avenue, Stockton 95202',
    district: '',
    medianHome: '$450,000',
    medianHomeValue: 450000,
    nearby: ['Lodi', 'Tracy', 'Manteca'],
    nearbySlug: ['modesto', 'sacramento', 'fresno'],
    region: 'Other Regions'
  },
  'modesto': {
    name: 'Modesto',
    slug: 'modesto',
    county: 'Stanislaus',
    courthouse: 'Stanislaus County Courthouse',
    courthouseAddress: '800 11th Street, Modesto 95354',
    district: '',
    medianHome: '$450,000',
    medianHomeValue: 450000,
    nearby: ['Turlock', 'Ceres', 'Ripon'],
    nearbySlug: ['stockton', 'fresno', 'bakersfield'],
    region: 'Other Regions'
  },
  'fontana': {
    name: 'Fontana',
    slug: 'fontana',
    county: 'San Bernardino',
    courthouse: 'Fontana Courthouse',
    courthouseAddress: '17780 Arrow Boulevard, Fontana 92335',
    district: '',
    medianHome: '$550,000',
    medianHomeValue: 550000,
    nearby: ['Rancho Cucamonga', 'Rialto', 'Ontario'],
    nearbySlug: ['riverside', 'moreno-valley'],
    region: 'Other Regions'
  },
  'oxnard': {
    name: 'Oxnard',
    slug: 'oxnard',
    county: 'Ventura',
    courthouse: 'Ventura County Superior Court',
    courthouseAddress: '800 S. Victoria Avenue, Ventura 93009',
    district: '',
    medianHome: '$700,000',
    medianHomeValue: 700000,
    nearby: ['Ventura', 'Camarillo', 'Port Hueneme'],
    nearbySlug: ['santa-barbara', 'carpinteria'],
    region: 'Other Regions'
  },
  'moreno-valley': {
    name: 'Moreno Valley',
    slug: 'moreno-valley',
    county: 'Riverside',
    courthouse: 'Riverside Historic Courthouse',
    courthouseAddress: '4050 Main Street, Riverside 92501',
    district: '',
    medianHome: '$550,000',
    medianHomeValue: 550000,
    nearby: ['Riverside', 'Perris', 'Hemet'],
    nearbySlug: ['riverside', 'fontana'],
    region: 'Other Regions'
  }
};

// Get all cities as array
export const ALL_CITIES = Object.values(CITY_DATA);

// Get cities by region
export const CITIES_BY_REGION = {
  'Los Angeles County': ALL_CITIES.filter(c => c.region === 'Los Angeles County'),
  'San Fernando Valley': ALL_CITIES.filter(c => c.region === 'San Fernando Valley'),
  'Orange County': ALL_CITIES.filter(c => c.region === 'Orange County'),
  'Santa Barbara County': ALL_CITIES.filter(c => c.region === 'Santa Barbara County'),
  'Bay Area': ALL_CITIES.filter(c => c.region === 'Bay Area'),
  'Other Regions': ALL_CITIES.filter(c => c.region === 'Other Regions')
};

// Calculate statutory fee based on estate value
export const calculateStatutoryFee = (estateValue) => {
  let fee = 0;
  let remaining = estateValue;

  if (remaining > 0) {
    const bracket = Math.min(remaining, 100000);
    fee += bracket * 0.04;
    remaining -= bracket;
  }
  if (remaining > 0) {
    const bracket = Math.min(remaining, 100000);
    fee += bracket * 0.03;
    remaining -= bracket;
  }
  if (remaining > 0) {
    const bracket = Math.min(remaining, 800000);
    fee += bracket * 0.02;
    remaining -= bracket;
  }
  if (remaining > 0) {
    const bracket = Math.min(remaining, 9000000);
    fee += bracket * 0.01;
    remaining -= bracket;
  }

  return Math.round(fee);
};

// Get city by slug
export const getCityBySlug = (slug) => CITY_DATA[slug] || null;

// Item list for schema
export const CITY_ITEM_LIST = ALL_CITIES.map((city, index) => ({
  "@type": "ListItem",
  "position": index + 1,
  "name": `${city.name} Probate Attorney`,
  "url": `https://myprobateca.com/locations/${city.slug}-probate-attorney`
}));
