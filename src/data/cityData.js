// All 35 California probate service area cities
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
    localHook: 'Glendale residents face unique probate challenges due to the city\'s substantial Armenian-American community and high property values averaging $1.2 million. Many estates involve family businesses along Brand Boulevard, multi-generational homes in the Verdugo Woodlands, and international assets requiring coordination with overseas relatives. The Stanley Mosk Courthouse in downtown Los Angeles handles Glendale probate cases, with typical wait times of 8-12 months. Our firm understands the cultural sensitivities and family dynamics common in Glendale estates, providing compassionate guidance through California\'s complex probate process while respecting traditional values and family structures.',
    nearby: ['Burbank', 'Pasadena', 'Los Angeles'],
    nearbySlug: ['burbank', 'pasadena', 'los-angeles'],
    waitTime: '8-12',
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
    localHook: 'Los Angeles probate cases present diverse challenges across the city\'s many neighborhoods, from Hollywood Hills estates to South LA family homes. As California\'s largest city, LA estates frequently involve entertainment industry assets, intellectual property rights, and complex real estate holdings across multiple properties. The Stanley Mosk Courthouse handles thousands of probate cases annually, making experienced legal guidance essential for efficient case management. Our firm navigates the unique requirements of LA County probate, from dealing with celebrity estates to managing multi-property portfolios, ensuring families receive personalized attention despite the court\'s high volume.',
    nearby: ['Santa Monica', 'Glendale', 'Long Beach'],
    nearbySlug: ['santa-monica', 'glendale', 'long-beach'],
    waitTime: '8-12',
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
    localHook: 'Burbank, the media capital of the world, presents unique probate considerations for estates involving entertainment industry employees and executives. With Disney, Warner Bros, and numerous production companies headquartered here, many estates include studio pension plans, residual rights, union benefits, and deferred compensation packages requiring specialized handling. Property values averaging $1.1 million combined with entertainment assets create complex estates. Our firm understands the intricacies of Burbank estates, from valuing intellectual property interests to navigating studio benefit programs, providing comprehensive probate administration for families connected to the entertainment industry.',
    nearby: ['Glendale', 'North Hollywood', 'Pasadena'],
    nearbySlug: ['glendale', 'pasadena'],
    waitTime: '8-12',
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
    localHook: 'Pasadena\'s historic estates and academic community create distinctive probate needs. Home to Caltech, JPL, and numerous research institutions, many estates involve academic pensions, research royalties, and intellectual property from scientific discoveries. The city\'s stunning Craftsman homes and historic estates in neighborhoods like San Rafael and Linda Vista often have preservation requirements affecting property transfers. The Pasadena Courthouse typically processes cases faster than downtown LA courts. Our firm serves Pasadena families with expertise in both historic property considerations and the unique assets common to the academic and scientific community.',
    nearby: ['Glendale', 'Altadena', 'Arcadia'],
    nearbySlug: ['glendale', 'burbank'],
    waitTime: '6-10',
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
    localHook: 'Encino represents one of the San Fernando Valley\'s most affluent communities, with median home values reaching $1.8 million in prestigious areas like Royal Oaks and Encino Hills. Many estates involve celebrity-owned properties, entertainment industry executives, and successful business owners who chose Encino for its combination of privacy and proximity to studios. Gated communities and estate-sized properties are common, often requiring detailed appraisals and security considerations during the probate process. Our firm provides discreet, professional probate services tailored to high-net-worth Encino families seeking to protect their privacy while efficiently administering substantial estates.',
    nearby: ['Sherman Oaks', 'Tarzana', 'Woodland Hills'],
    nearbySlug: ['sherman-oaks', 'tarzana', 'woodland-hills'],
    waitTime: '6-10',
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
    localHook: 'Sherman Oaks combines upscale Valley living with a thriving business community along Ventura Boulevard. Estates here often include commercial real estate holdings, professional practice assets, and substantial residential properties in sought-after neighborhoods south of the boulevard. Many entertainment industry professionals and business owners have made Sherman Oaks home, creating estates with diverse asset portfolios. The Van Nuys Courthouse East handles probate cases for Sherman Oaks residents with generally shorter wait times than downtown courts. Our firm serves Sherman Oaks families with comprehensive probate services addressing both residential and commercial property considerations.',
    nearby: ['Encino', 'Studio City', 'Van Nuys'],
    nearbySlug: ['encino', 'tarzana', 'woodland-hills'],
    waitTime: '6-10',
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
    localHook: 'Woodland Hills serves as the western San Fernando Valley\'s commercial and residential hub, anchored by the Warner Center business district. Estates frequently include corporate executive benefits, stock options, and business interests alongside substantial residential properties. The community\'s diverse housing stock ranges from condominiums near Warner Center to hillside estates along Mulholland Drive. Many residents are successful professionals who accumulated significant assets throughout their careers. Our firm provides Woodland Hills families with experienced probate guidance, addressing the varied asset types common in this dynamic West Valley community while ensuring efficient court processing.',
    nearby: ['Calabasas', 'Tarzana', 'Canoga Park'],
    nearbySlug: ['calabasas', 'tarzana', 'encino'],
    waitTime: '6-10',
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
    localHook: 'Tarzana, named after the famous literary character created by former resident Edgar Rice Burroughs, features a prominent medical corridor and prestigious hillside estates. Many estates involve healthcare professional practices, medical partnerships, and retirement benefits from the numerous hospitals and medical facilities in the area. The community\'s ranch-style homes and hillside properties often exceed $1.4 million in value. Our firm understands the unique considerations of Tarzana estates, from valuing medical practice interests to handling the substantial residential properties that characterize this established San Fernando Valley community, providing comprehensive probate services tailored to local needs.',
    nearby: ['Encino', 'Woodland Hills', 'Reseda'],
    nearbySlug: ['encino', 'woodland-hills', 'sherman-oaks'],
    waitTime: '6-10',
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
    localHook: 'Calabasas ranks among California\'s most exclusive communities, with median home values reaching $2.5 million in gated enclaves like The Oaks, Hidden Hills adjacent areas, and Calabasas Park Estates. Celebrity residents, entertainment executives, and successful entrepreneurs create estates requiring sophisticated handling and absolute discretion. Many properties feature extensive grounds, guest houses, and luxury amenities requiring detailed appraisals. High-value estates in Calabasas frequently require full probate administration rather than simplified procedures. Our firm provides confidential, expert probate services for Calabasas families, understanding the privacy concerns and complex asset structures common in this prestigious community.',
    nearby: ['Woodland Hills', 'Hidden Hills', 'Malibu'],
    nearbySlug: ['woodland-hills', 'tarzana', 'santa-monica'],
    waitTime: '6-10',
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
    localHook: 'Santa Monica\'s beachfront location and thriving tech industry create unique probate considerations. Estates often include valuable oceanfront or ocean-view properties, Silicon Beach startup equity, and entertainment industry assets. The city\'s rent-controlled properties require special handling during probate to preserve tenant rights and property value. The Santa Monica Courthouse provides convenient local access for probate proceedings. Many estates involve complex ownership structures for beach properties and significant investment portfolios from tech industry wealth. Our firm serves Santa Monica families with expertise in coastal property transfers, startup equity valuation, and the distinctive real estate considerations of this desirable Westside community.',
    nearby: ['Venice', 'Pacific Palisades', 'Brentwood'],
    nearbySlug: ['los-angeles', 'long-beach'],
    waitTime: '6-10',
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
    localHook: 'Long Beach offers diverse neighborhoods from the historic estates of Naples Island and Belmont Shore to the family communities of Bixby Knolls and California Heights. As a major port city, many estates involve maritime industry pensions, shipping business interests, and oil royalties from the city\'s historic petroleum industry. The Governor George Deukmejian Courthouse handles Long Beach probate cases efficiently. Waterfront properties, including those on Naples\' canals, require specialized appraisals. Our firm serves Long Beach families across all neighborhoods, providing experienced probate administration for the varied estate types found throughout California\'s seventh-largest city.',
    nearby: ['Lakewood', 'Signal Hill', 'Carson'],
    nearbySlug: ['los-angeles', 'santa-monica', 'anaheim'],
    waitTime: '6-10',
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
    localHook: 'Santa Clarita has grown from a small community to one of California\'s largest cities, attracting families seeking suburban living with reasonable commutes to Los Angeles. Estates often involve properties purchased during the area\'s rapid development phases, now with significant equity appreciation. The entertainment industry maintains a strong presence with studios and production facilities nearby. The Santa Clarita Courthouse provides convenient local probate processing. Our firm serves Santa Clarita families across Valencia, Newhall, Saugus, and Canyon Country, providing efficient probate administration for the family-oriented estates common in this thriving north Los Angeles County community.',
    nearby: ['Valencia', 'Newhall', 'Castaic'],
    nearbySlug: ['calabasas', 'woodland-hills'],
    waitTime: '6-10',
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
    localHook: 'Anaheim, home to Disneyland and Angel Stadium, presents diverse probate needs across its varied neighborhoods. From the historic Anaheim Colony district to the Anaheim Hills communities, estates reflect the city\'s evolution from agricultural center to tourist destination. Many estates involve hospitality industry interests, long-held family properties with significant appreciation, and diverse communities with international family connections. Orange County\'s Lamoreaux Justice Center handles probate efficiently. Our firm serves Anaheim families across all neighborhoods, understanding the unique considerations of this dynamic city where tourism, sports, and diverse residential communities create varied estate planning and probate needs.',
    nearby: ['Orange', 'Fullerton', 'Garden Grove'],
    nearbySlug: ['irvine', 'newport-beach', 'huntington-beach'],
    waitTime: '6-10',
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
    localHook: 'Irvine\'s master-planned communities and thriving tech sector create estates with substantial real estate holdings and corporate assets. Home to UC Irvine and numerous technology companies, many estates include academic retirement benefits, stock options, and startup equity alongside properties in villages like Turtle Rock, Woodbridge, and Northwood. The city\'s HOA-governed communities may have transfer requirements affecting probate timelines. Our firm understands Irvine\'s unique real estate landscape and the corporate assets common among its residents, providing comprehensive probate services that address both the substantial property values and complex investment portfolios typical of this affluent Orange County city.',
    nearby: ['Newport Beach', 'Tustin', 'Costa Mesa'],
    nearbySlug: ['newport-beach', 'anaheim', 'huntington-beach'],
    waitTime: '6-10',
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
    localHook: 'Newport Beach represents Orange County\'s pinnacle of waterfront luxury, with median home values reaching $3.5 million in areas like Corona del Mar, Newport Coast, and Balboa Island. Estates frequently include yacht ownership, marina slip leases, and waterfront properties requiring specialized marine appraisals. Many residents are successful business owners, investors, and retirees with complex portfolios including real estate holdings beyond their primary residence. High-value estates typically require full probate administration. Our firm provides sophisticated probate services for Newport Beach families, understanding the luxury lifestyle assets, significant real estate holdings, and privacy expectations of this exclusive coastal community.',
    nearby: ['Irvine', 'Corona del Mar', 'Laguna Beach'],
    nearbySlug: ['irvine', 'huntington-beach', 'anaheim'],
    waitTime: '6-10',
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
    localHook: 'Huntington Beach, known as Surf City USA, combines beach culture with established residential communities and a legacy oil industry presence. Estates may include valuable beachfront properties, oil royalty rights from the city\'s petroleum heritage, and long-held family homes with significant appreciation. The city\'s diverse neighborhoods range from downtown near the pier to inland communities like Huntington Harbour with waterfront homes. Our firm serves Huntington Beach families with expertise in coastal property transfers, mineral rights considerations, and the varied estate types found across this iconic Orange County beach city, ensuring efficient probate processing through the Lamoreaux Justice Center.',
    nearby: ['Fountain Valley', 'Westminster', 'Seal Beach'],
    nearbySlug: ['irvine', 'newport-beach', 'anaheim'],
    waitTime: '6-10',
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
    localHook: 'Santa Barbara, the American Riviera, presents unique probate considerations with its historic Spanish Colonial estates, UCSB academic community, and wine country properties. Many estates involve historic homes with preservation requirements, vineyard and winery interests in the nearby Santa Ynez Valley, and vacation properties requiring year-round management during probate. The stunning Santa Barbara Courthouse, itself a historic landmark, handles local probate cases. Our firm serves Santa Barbara families with appreciation for the community\'s distinctive character, providing experienced probate administration for estates ranging from downtown condominiums to sprawling Riviera estates with views of the Pacific Ocean.',
    nearby: ['Montecito', 'Goleta', 'Carpinteria'],
    nearbySlug: ['montecito', 'goleta', 'carpinteria'],
    waitTime: '6-10',
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
    localHook: 'Montecito ranks among America\'s most exclusive communities, with median home values reaching $5 million and many estates far exceeding that figure. Home to celebrities, tech billionaires, and old California wealth, estates require absolute discretion and sophisticated asset management. Properties often include extensive grounds, guest houses, and staff quarters requiring complex administration. The community\'s private nature means many residents prefer quiet, efficient probate handling without public attention. Our firm provides confidential, expert probate services for Montecito families, understanding that estates in this community demand experienced counsel familiar with high-net-worth estate administration and the privacy expectations of distinguished residents.',
    nearby: ['Santa Barbara', 'Summerland', 'Carpinteria'],
    nearbySlug: ['santa-barbara', 'carpinteria', 'goleta'],
    waitTime: '6-10',
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
    localHook: 'Goleta has evolved from an agricultural community to a thriving tech hub adjacent to UC Santa Barbara. Many estates involve aerospace industry pensions and benefits, technology company equity, and academic retirement plans from the university. The city\'s neighborhoods offer more affordable options than Santa Barbara proper while maintaining coastal Santa Barbara County appeal. Properties may include ranch-style homes, newer developments, and some remaining agricultural parcels. Our firm serves Goleta families with expertise in the tech and academic assets common to this community, providing efficient probate administration through the Santa Barbara Courthouse for estates of varying complexity and value.',
    nearby: ['Santa Barbara', 'Isla Vista', 'Gaviota'],
    nearbySlug: ['santa-barbara', 'isla-vista', 'carpinteria'],
    waitTime: '6-10',
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
    localHook: 'Carpinteria offers small-town coastal living between Santa Barbara and Ventura, with estates reflecting its agricultural heritage and beachside appeal. Many properties include avocado groves, flower farming operations, or oceanfront parcels requiring specialized agricultural and coastal appraisals. The town\'s tight-knit community often means multi-generational properties with complex family histories. Some estates involve commercial interests in the small downtown area or beachfront vacation rentals. Our firm serves Carpinteria families with understanding of both agricultural and coastal property considerations, providing personalized probate services that respect the community\'s character while ensuring efficient estate administration.',
    nearby: ['Santa Barbara', 'Montecito', 'Ventura'],
    nearbySlug: ['santa-barbara', 'montecito', 'oxnard'],
    waitTime: '6-10',
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
    localHook: 'Isla Vista\'s unique position adjacent to UC Santa Barbara creates a distinctive real estate market dominated by rental properties serving the student population. Estates often involve income-producing rental properties with existing tenant leases requiring careful management during probate. Some longtime property owners have accumulated multiple units, creating complex portfolios requiring detailed income analysis and property management during administration. Our firm understands Isla Vista\'s rental market dynamics and student housing considerations, providing probate services that maintain rental income streams while efficiently administering estates in this unique coastal community adjacent to one of California\'s premier universities.',
    nearby: ['Goleta', 'Santa Barbara'],
    nearbySlug: ['goleta', 'santa-barbara'],
    waitTime: '6-10',
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
    localHook: 'San Francisco probate requires navigating one of the nation\'s strictest court systems with detailed examiner reviews. Estates often include valuable Victorian and Edwardian homes, tech industry stock options, and startup equity requiring complex valuation. The city\'s rent-controlled properties demand special handling to preserve tenant rights and property value. Court examiners scrutinize filings carefully, making experienced legal guidance essential. Many estates involve properties in neighborhoods from Pacific Heights to the Mission, each with distinct considerations. Our firm provides San Francisco families with the meticulous attention to detail required by local courts while efficiently managing the diverse assets typical of this world-class city.',
    nearby: ['Oakland', 'Daly City', 'Berkeley'],
    nearbySlug: ['oakland', 'fremont', 'san-jose'],
    waitTime: '8-12',
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
    localHook: 'San Jose, the capital of Silicon Valley, presents estates frequently involving tech industry wealth including stock options, restricted stock units, and startup equity requiring sophisticated valuation. Many residents accumulated significant assets through careers at Apple, Google, Cisco, and numerous other technology companies headquartered in the region. Property values reflect the tech boom with homes in neighborhoods like Willow Glen and Almaden Valley commanding premium prices. Our firm serves San Jose families with expertise in tech industry compensation packages, equity valuation, and the substantial real estate holdings common among Silicon Valley professionals, providing comprehensive probate administration for complex modern estates.',
    nearby: ['Cupertino', 'Santa Clara', 'Sunnyvale'],
    nearbySlug: ['san-francisco', 'oakland', 'fremont'],
    waitTime: '8-12',
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
    localHook: 'Oakland\'s diverse neighborhoods from the hills of Montclair to the waterfront of Jack London Square present varied estate challenges. Many properties have experienced dramatic appreciation, creating substantial estates from modest original purchases. The city\'s rich history includes multi-generational family homes, Port of Oakland-connected businesses, and a growing tech presence. Properties may be subject to Oakland\'s rent control ordinances requiring careful handling during probate. The Rene C. Davidson Courthouse handles Alameda County probate cases. Our firm serves Oakland families across all neighborhoods with experienced probate administration that respects the city\'s diverse communities while efficiently managing estates of varying complexity.',
    nearby: ['Berkeley', 'Alameda', 'San Leandro'],
    nearbySlug: ['san-francisco', 'fremont', 'san-jose'],
    waitTime: '8-12',
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
    localHook: 'Fremont\'s position in the East Bay tech corridor creates estates frequently involving Silicon Valley employment benefits, stock options, and substantial real estate holdings. The Tesla factory and numerous tech companies have attracted professionals who accumulated significant wealth. The city\'s diverse Asian-American communities often have international family connections requiring coordination with overseas relatives. Property values have surged, with homes in Mission San Jose and Niles districts commanding premium prices. The local Fremont Hall of Justice provides convenient probate processing. Our firm serves Fremont families with expertise in tech industry assets and the cultural considerations important to the city\'s diverse communities.',
    nearby: ['Newark', 'Union City', 'Milpitas'],
    nearbySlug: ['oakland', 'san-jose', 'san-francisco'],
    waitTime: '6-10',
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
    localHook: 'San Diego presents unique probate considerations with its large military presence, thriving biotech industry, and border region location. Many estates involve military pensions and survivor benefits, defense contractor retirement plans, and biotech company equity. The city\'s diverse neighborhoods from La Jolla\'s oceanfront to suburban Rancho Bernardo create varied estate values and complexities. Some estates include cross-border considerations with family in Mexico. Our firm serves San Diego families with understanding of military benefits, biotech industry assets, and the diverse property types found throughout California\'s second-largest city, providing comprehensive probate administration through the San Diego Central Courthouse.',
    nearby: ['La Jolla', 'Chula Vista', 'Coronado'],
    nearbySlug: ['riverside', 'anaheim'],
    waitTime: '6-10',
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
    localHook: 'Sacramento, California\'s capital city, presents estates often involving state government pensions, CalPERS benefits, and properties in historic neighborhoods like Land Park and East Sacramento. Many longtime state employees accumulated substantial retirement benefits requiring careful administration. The city\'s growing medical and technology sectors add diversity to estate compositions. Properties range from Victorian homes in Midtown to suburban communities in Natomas and Elk Grove. Our firm serves Sacramento families with expertise in public employee benefits, state retirement plans, and the varied real estate found throughout the capital region, providing efficient probate administration through the William R. Ridgeway Courthouse.',
    nearby: ['Elk Grove', 'Roseville', 'Folsom'],
    nearbySlug: ['stockton', 'modesto', 'fresno'],
    waitTime: '6-10',
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
    localHook: 'Riverside, the Inland Empire\'s largest city, combines historic citrus heritage with UC Riverside\'s academic community. Many estates involve multi-generational properties that have appreciated significantly, university retirement benefits, and remaining agricultural interests from the region\'s orange grove history. The city\'s neighborhoods range from the historic Mission Inn district to hillside communities with valley views. The beautiful Riverside Historic Courthouse handles probate for this growing region. Our firm serves Riverside families with expertise in both academic retirement benefits and the varied property types found throughout this historic city, providing efficient probate administration for the Inland Empire\'s diverse estates.',
    nearby: ['Moreno Valley', 'Corona', 'San Bernardino'],
    nearbySlug: ['moreno-valley', 'fontana', 'san-diego'],
    waitTime: '6-10',
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
    localHook: 'Fresno serves as the Central Valley\'s largest city and agricultural hub, with estates often involving farming operations, agricultural land, and related business interests. Many families have multi-generational farming operations requiring careful succession planning and specialized agricultural appraisals. Fresno State University contributes an academic community with retirement benefits and research interests. Property types range from downtown commercial buildings to rural agricultural parcels and suburban homes in northeast Fresno. Our firm serves Fresno families with understanding of agricultural estate considerations, farm succession issues, and the varied assets found throughout the Central Valley\'s largest metropolitan area.',
    nearby: ['Clovis', 'Madera', 'Visalia'],
    nearbySlug: ['bakersfield', 'modesto', 'stockton'],
    waitTime: '6-10',
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
    localHook: 'Bakersfield\'s economy combines oil production, agriculture, and a growing logistics sector, creating diverse estate compositions. Many estates involve oil royalty interests, mineral rights, and working interests in petroleum operations requiring specialized valuation. Agricultural land, particularly for table grapes, almonds, and citrus, adds complexity to estate administration. The city\'s country music heritage and working-class roots mean many families have accumulated modest but meaningful estates over lifetimes of hard work. Our firm serves Bakersfield families with expertise in energy industry assets, agricultural valuations, and the practical probate needs of this hardworking Central Valley community.',
    nearby: ['Tehachapi', 'Delano', 'Taft'],
    nearbySlug: ['fresno', 'modesto'],
    waitTime: '6-10',
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
    localHook: 'Stockton, a major inland port city, presents estates reflecting its diverse economy including port operations, University of the Pacific academics, and Central Valley agriculture. Many estates involve waterfront properties along the Delta, agricultural interests, and multi-generational family homes that have experienced recent appreciation. The city\'s diverse communities include substantial Filipino, Hispanic, and Southeast Asian populations with international family connections. Our firm serves Stockton families with understanding of the varied assets common in this port city, from Delta waterway properties to agricultural holdings, providing culturally sensitive probate administration through the Stockton Courthouse.',
    nearby: ['Lodi', 'Tracy', 'Manteca'],
    nearbySlug: ['modesto', 'sacramento', 'fresno'],
    waitTime: '6-10',
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
    localHook: 'Modesto, celebrated as George Lucas\'s hometown and the setting for American Graffiti, combines Central Valley agriculture with a growing suburban population. Many estates involve almond orchards, dairy operations, and the Gallo winery industry that dominates the region. Multi-generational farming families often face complex succession issues involving agricultural land and equipment. The city\'s newer suburban developments have attracted Bay Area transplants seeking affordability. Our firm serves Modesto families with expertise in agricultural estate matters, Central Valley farming operations, and the varied property types found in this growing Stanislaus County community, providing efficient probate through the local courthouse.',
    nearby: ['Turlock', 'Ceres', 'Ripon'],
    nearbySlug: ['stockton', 'fresno', 'bakersfield'],
    waitTime: '6-10',
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
    localHook: 'Fontana has transformed from a steel mill town to one of the Inland Empire\'s fastest-growing cities, anchored by the Auto Club Speedway and massive logistics operations. Many estates involve properties purchased during the region\'s rapid growth phases, now with significant equity appreciation. The city\'s diverse working-class communities include many families who built wealth through logistics, transportation, and construction careers. Some estates may include commercial properties or business interests in the expanding warehouse district. Our firm serves Fontana families with practical probate services appropriate for working families, efficiently administering estates through the convenient Fontana Courthouse.',
    nearby: ['Rancho Cucamonga', 'Rialto', 'Ontario'],
    nearbySlug: ['riverside', 'moreno-valley'],
    waitTime: '6-10',
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
    localHook: 'Oxnard combines agricultural heritage with a growing coastal community near the Channel Islands Harbor. Many estates involve strawberry farming operations, agricultural land, and related agribusiness interests. The city\'s Port Hueneme Naval Base contributes military families with service-connected benefits requiring careful administration. Coastal properties near Hollywood Beach and the harbor add complexity with waterfront valuations. Our firm serves Oxnard families with understanding of both agricultural and military estate considerations, the diverse property types from farmland to beachfront, and the cultural sensitivities important to this largely Hispanic community, providing efficient probate through the Ventura County Superior Court.',
    nearby: ['Ventura', 'Camarillo', 'Port Hueneme'],
    nearbySlug: ['santa-barbara', 'carpinteria'],
    waitTime: '6-10',
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
    localHook: 'Moreno Valley has grown rapidly from a small community to one of the Inland Empire\'s largest cities, with March Air Reserve Base as a major economic anchor. Many estates involve military pensions, VA benefits, and properties purchased during the region\'s explosive growth phases. The city\'s diverse communities include many families who relocated from Los Angeles and Orange Counties seeking affordable homeownership. Properties have appreciated significantly, creating meaningful estates for working families. Our firm serves Moreno Valley families with expertise in military benefits administration and the practical probate needs of this growing, diverse Riverside County community, processing cases through the Riverside Historic Courthouse.',
    nearby: ['Riverside', 'Perris', 'Hemet'],
    nearbySlug: ['riverside', 'fontana'],
    waitTime: '6-10',
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
  "url": `https://myprobateca.com/locations/${city.slug}-probate-attorney/`
}));
