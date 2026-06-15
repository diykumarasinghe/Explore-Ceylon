import type { Destination } from '../types';

// Royalty-free images sourced from Unsplash (unsplash.com/license - free for commercial use).
// Images are saved locally under src/assets/destinations/.
import sigiriyaImg from '../assets/destinations/sigiriya.png';
import ellaImg from '../assets/destinations/ella.png';
import mirissaImg from '../assets/destinations/mirissa.png';
import kandyImg from '../assets/destinations/kandy.png';
import galleImg from '../assets/destinations/galle.png';
import yalaImg from '../assets/destinations/yala.png';
import nuwraElilyaImg from '../assets/destinations/nuwara-eliya.png';
import arugamBayImg from '../assets/destinations/arugam-bay.jpg';
import bentotaImg from '../assets/destinations/bentota.png';
import hikkaduwaImg from '../assets/destinations/hikkaduwa.png';
import anuradhapuraImg from '../assets/destinations/anuradhapura.png';
import polonnaruwaImg from '../assets/destinations/polonnaruwa.png';
import hortonPlainsImg from '../assets/destinations/horton-plains.png';
import udawalaweImg from '../assets/destinations/udawalawe.png';
import adamsPeakImg from '../assets/destinations/adams-peak.png';

export const mockDestinations: Destination[] = [
  // ─── Heritage ────────────────────────────────────────────────────────────────
  {
    id: 'dest-sigiriya',
    name: 'Sigiriya Rock Fortress',
    category: 'Heritage',
    location: 'Matale District, Central Province',
    description:
      'Rising almost 200 metres above the surrounding jungle, Sigiriya is a breathtaking ancient citadel carved into a volcanic rock column by King Kashyapa in the 5th century. The climb rewards visitors with panoramic views, vivid frescoes of celestial maidens painted into the cliff face, and the legendary Mirror Wall etched with verses over a thousand years old.',
    image: sigiriyaImg,
    bestTimeToVisit: 'January – April',
    activities: [
      'Rock Climbing & Summit Trek',
      'Fresco Gallery Tour',
      'Mirror Wall Walk',
      'Water Garden Exploration',
      'Museum Visit',
      'Photography',
    ],
    highlights: [
      'UNESCO World Heritage Site',
      '5th-century royal palace ruins',
      'Iconic Sigiriya Frescoes',
      'Ancient hydraulic water gardens',
      'Panoramic views of the Central Province',
    ],
    budgetRange: 'LKR 25,000 - 50,000',
    rating: 4.9,
  },
  {
    id: 'dest-galle',
    name: 'Galle Fort',
    category: 'Heritage',
    location: 'Galle District, Southern Province',
    description:
      'Built by the Portuguese in the 16th century and later expanded by Dutch colonisers, Galle Fort is a remarkably intact example of colonial coastal fortification blended with South Asian architectural traditions. Inside its ramparts you will find cobblestone streets lined with boutique hotels, art galleries, spice shops, and charming cafés, all overlooking the turquoise Indian Ocean.',
    image: galleImg,
    bestTimeToVisit: 'November – April',
    activities: [
      'Fort Rampart Walk at Sunset',
      'Lighthouse Photography',
      'Boutique Shopping',
      'Local Café Hopping',
      'Maritime Museum Tour',
      'Whale Watching Boat Trips',
    ],
    highlights: [
      'UNESCO World Heritage Site',
      'Best-preserved colonial fort in South Asia',
      'Dutch Reformed Church (1755)',
      'Galle Lighthouse – oldest in Sri Lanka',
      'Vibrant arts and craft scene',
    ],
    budgetRange: 'LKR 25,000 - 50,000',
    rating: 4.7,
  },
  {
    id: 'dest-anuradhapura',
    name: 'Sacred City of Anuradhapura',
    category: 'Heritage',
    location: 'Anuradhapura District, North Central Province',
    description:
      'For over a thousand years Anuradhapura served as the capital of ancient Sri Lanka, and its sprawling archaeological zone preserves colossal brick dagobas, ornate moonstones, and palatial ruins that reflect the height of classical Sinhalese civilisation. The revered Jaya Sri Maha Bodhi tree – a cutting of the original Bodhi tree under which the Buddha attained enlightenment – has been tended here continuously for over 2,200 years.',
    image: anuradhapuraImg,
    bestTimeToVisit: 'May – September',
    activities: [
      'Ruwanwelisaya Stupa Pilgrimage',
      'Jaya Sri Maha Bodhi Offering',
      'Cycling Through the Archaeological Zone',
      'Jetavanarama Museum Tour',
      'Isurumuniya Rock Temple Exploration',
      'Sunset at Tissa Wewa Reservoir',
    ],
    highlights: [
      'UNESCO World Heritage Site',
      'Jaya Sri Maha Bodhi – world\'s oldest documented tree',
      'Massive Ruwanwelisaya Dagoba',
      'Jetavanarama – once the world\'s third-tallest structure',
      'Over 2,500 years of continuous civilisation',
    ],
    budgetRange: 'LKR 10,000 - 25,000',
    rating: 4.8,
  },
  {
    id: 'dest-polonnaruwa',
    name: 'Ancient City of Polonnaruwa',
    category: 'Heritage',
    location: 'Polonnaruwa District, North Central Province',
    description:
      'Flourishing as Sri Lanka\'s second medieval capital from the 11th to 13th centuries, Polonnaruwa is a compact and well-preserved complex of royal palaces, Hindu temples, magnificent stupas, and serene Buddha statues carved directly into the rock. The iconic Gal Vihara – four colossal Buddha figures sculpted from a single granite face – is considered one of the finest examples of ancient rock-relief art in Asia.',
    image: polonnaruwaImg,
    bestTimeToVisit: 'May – September',
    activities: [
      'Gal Vihara Rock Sculpture Tour',
      'Cycling the Ruins Circuit',
      'Parakrama Samudra Lake Walk',
      'Rankoth Vehera Stupa Visit',
      'Royal Palace Complex Exploration',
      'Quadrangle Sacred Area Tour',
    ],
    highlights: [
      'UNESCO World Heritage Site',
      'Gal Vihara – magnificent rock-carved Buddha statues',
      'Parakrama Samudra – ancient irrigation marvel',
      'Well-preserved medieval city layout',
      'Rich mix of Buddhist and Hindu architecture',
    ],
    budgetRange: 'LKR 10,000 - 25,000',
    rating: 4.8,
  },

  // ─── Culture ──────────────────────────────────────────────────────────────────
  {
    id: 'dest-kandy',
    name: 'Sacred City of Kandy',
    category: 'Culture',
    location: 'Kandy District, Central Province',
    description:
      'Nestled in a mountain valley and cradled by misty peaks, Kandy is the cultural heartbeat of Sri Lanka. The city centres on the Sri Dalada Maligawa – Temple of the Sacred Tooth Relic – one of Buddhism\'s most venerated shrines. Every August, the dazzling Esala Perahera procession fills the streets with adorned elephants, costumed dancers, fire performers, and thousands of pilgrims in a spectacle unlike any other.',
    image: kandyImg,
    bestTimeToVisit: 'December – April',
    activities: [
      'Temple of the Tooth Relic Visit',
      'Kandy Lake Evening Stroll',
      'Kandyan Cultural Dance Show',
      'Royal Botanical Gardens Tour',
      'Udawatta Kele Sanctuary Birdwatching',
      'Tea Museum Tour',
    ],
    highlights: [
      'UNESCO World Heritage Site',
      'Sri Dalada Maligawa – sacred tooth relic',
      'Annual Esala Perahera festival (August)',
      'Royal Botanical Gardens Peradeniya',
      'Gateway to the hill country',
    ],
    budgetRange: 'LKR 25,000 - 50,000',
    rating: 4.8,
  },

  // ─── Beach ────────────────────────────────────────────────────────────────────
  {
    id: 'dest-mirissa',
    name: 'Mirissa Beach',
    category: 'Beach',
    location: 'Matara District, Southern Province',
    description:
      'Sheltered by a lush headland and fringed with swaying coconut palms, Mirissa is a crescent-shaped paradise where the southern coast\'s warmest waters meet world-class surf. From November through April the bay is also one of the planet\'s premier whale-watching locations, with blue whales and spinner dolphins frequently spotted just kilometres offshore.',
    image: mirissaImg,
    bestTimeToVisit: 'November – April',
    activities: [
      'Blue Whale & Dolphin Watching',
      'Surfing & Bodyboarding',
      'Coconut Tree Hill Sunrise',
      'Snorkelling',
      'Beachfront Dining & Night Markets',
      'Fishing Village Tour',
    ],
    highlights: [
      'One of the world\'s top whale-watching spots',
      'Pristine crescent beach',
      'Iconic Coconut Tree Hill',
      'Laid-back beach bar culture',
      'Accessible from Galle and Matara',
    ],
    budgetRange: 'LKR 25,000 - 50,000',
    rating: 4.7,
  },
  {
    id: 'dest-bentota',
    name: 'Bentota Beach & River',
    category: 'Beach',
    location: 'Galle District, Southern Province',
    description:
      'Stretching along a narrow peninsula between the Indian Ocean and the tranquil Bentota River, this twin-faced resort destination offers golden sandy beaches on one side and serene mangrove lagoons on the other. Bentota is internationally known as Sri Lanka\'s watersports capital, while its river corridor shelters rare species of monitor lizards, crocodiles, and nesting sea turtles.',
    image: bentotaImg,
    bestTimeToVisit: 'November – April',
    activities: [
      'Jet Skiing & Windsurfing',
      'Banana Boat Rides',
      'Mangrove River Safari',
      'Sea Turtle Hatchery Visit',
      'Brief Garden – Geoffrey Bawa Tour',
      'Snorkelling at Hikkaduwa Reef',
    ],
    highlights: [
      'Sri Lanka\'s premier watersports hub',
      'Bentota River mangrove ecosystem',
      'Sea turtle conservation hatcheries',
      'Geoffrey Bawa\'s legendary Brief Garden',
      'Tranquil resort atmosphere',
    ],
    budgetRange: 'LKR 50,000 - 100,000',
    rating: 4.5,
  },
  {
    id: 'dest-hikkaduwa',
    name: 'Hikkaduwa',
    category: 'Beach',
    location: 'Galle District, Southern Province',
    description:
      'Long celebrated as Sri Lanka\'s original beach escape, Hikkaduwa pairs a vibrant reef ecosystem with a lively café and surf culture. The shallow Hikkaduwa Coral Sanctuary teems with sea turtles, parrotfish, and moray eels, making it one of the country\'s most accessible snorkelling experiences. After dark the town transforms into a buzzing strip of rooftop bars and seafood grills.',
    image: hikkaduwaImg,
    bestTimeToVisit: 'November – April',
    activities: [
      'Coral Sanctuary Snorkelling',
      'Surfing at Narigama',
      'Glass-bottom Boat Reef Tour',
      'Scuba Diving',
      'Turtle Watching',
      'Beachside Seafood Dining',
    ],
    highlights: [
      'Hikkaduwa Coral Reef National Park',
      'Resident sea turtles on the beach',
      'Diverse surf breaks for all levels',
      'Vibrant nightlife and beach bars',
      'Only 100 km from Colombo',
    ],
    budgetRange: 'LKR 25,000 - 50,000',
    rating: 4.5,
  },

  // ─── Hill Country ─────────────────────────────────────────────────────────────
  {
    id: 'dest-ella',
    name: 'Ella',
    category: 'Hill Country',
    location: 'Badulla District, Uva Province',
    description:
      'Draped across a ridge in the Uva Highlands, Ella is a place of extraordinary natural drama where emerald tea plantations cascade into deep gorges and cloud-laden peaks rise on every horizon. The village itself is small but brimming with character – boutique cafés, yoga studios, and rock-climbing walls reflect the mix of backpackers and wellness travellers drawn here by its legendary scenic train ride and trekking trails.',
    image: ellaImg,
    bestTimeToVisit: 'January – May',
    activities: [
      'Little Adam\'s Peak Sunrise Hike',
      'Nine Arch Bridge Walk',
      'Ravana Falls Swimming',
      'Tea Estate & Factory Tour',
      'Scenic Train Ride from Kandy',
      'Rock Climbing at Ella Rock',
    ],
    highlights: [
      'Nine Arch Bridge – Sri Lanka\'s most photographed landmark',
      'Ella Gap viewpoint panorama',
      'World\'s most scenic train journey (Kandy–Ella)',
      'Little Adam\'s Peak easy hike',
      'Ravana Falls and Ravana Cave',
    ],
    budgetRange: 'LKR 25,000 - 50,000',
    rating: 4.8,
  },
  {
    id: 'dest-nuwara-eliya',
    name: 'Nuwara Eliya',
    category: 'Hill Country',
    location: 'Nuwara Eliya District, Central Province',
    description:
      'Perched at nearly 2,000 metres above sea level, Nuwara Eliya earns its nickname "Little England" through its colonial-era bungalows, manicured rose gardens, misty cricket grounds, and the refreshingly cool climate that surprises first-time visitors to tropical Sri Lanka. Vast carpets of tea bushes rolling across the surrounding hills produce some of the finest high-grown Ceylon teas in the world.',
    image: nuwraElilyaImg,
    bestTimeToVisit: 'March – May',
    activities: [
      'Tea Estate & Factory Tour',
      'Gregory Lake Boating & Zip-lining',
      'Horton Plains Day Trip',
      'Victoria Park Birdwatching',
      'Hakgala Botanical Gardens Visit',
      'Golf at Nuwara Eliya Golf Club',
    ],
    highlights: [
      'Highest city in Sri Lanka (1,868 m)',
      'World-renowned high-grown Ceylon tea',
      'Colonial-era architecture and gardens',
      'Gregory Lake – popular picnic and recreation spot',
      'Gateway to Horton Plains National Park',
    ],
    budgetRange: 'LKR 50,000 - 100,000',
    rating: 4.6,
  },

  // ─── Wildlife ─────────────────────────────────────────────────────────────────
  {
    id: 'dest-yala',
    name: 'Yala National Park',
    category: 'Wildlife',
    location: 'Hambantota & Monaragala Districts, Southern Province',
    description:
      'Spanning over 97,000 hectares of dry monsoon forest, scrubland, and coastal wetlands, Yala is Sri Lanka\'s most famous wildlife sanctuary and home to the highest density of leopards anywhere on Earth. The park\'s diverse mosaic of habitats supports a staggering assembly of fauna – from massive bull elephants and lumbering sloth bears to saltwater crocodiles and an extraordinary 215 species of birds.',
    image: yalaImg,
    bestTimeToVisit: 'February – June',
    activities: [
      '4×4 Jungle Safari',
      'Leopard & Elephant Spotting',
      'Bird Photography',
      'Sithulpawwa Rock Temple Visit',
      'Buttuwa Lagoon Walk',
      'Coastal Camping',
    ],
    highlights: [
      'Highest leopard density in the world',
      'Large resident elephant herds',
      'Over 215 bird species including painted storks',
      'Spectacular coastal landscapes within the park',
      'Sithulpawwa ancient rock temple',
    ],
    budgetRange: 'LKR 50,000 - 100,000',
    rating: 4.9,
  },
  {
    id: 'dest-udawalawe',
    name: 'Udawalawe National Park',
    category: 'Wildlife',
    location: 'Ratnapura & Hambantota Districts',
    description:
      'Centred on a vast reservoir fed by the Walawe River, Udawalawe is Sri Lanka\'s most elephant-friendly park and arguably the best place on the island for guaranteed close encounters with wild elephants. Herds of up to 50 individuals graze the open grasslands throughout the day, while the neighbouring Elephant Transit Home rehabilitates orphaned calves and releases them back into the wild.',
    image: udawalaweImg,
    bestTimeToVisit: 'June – September & December – March',
    activities: [
      'Elephant Herd Safari',
      'Elephant Transit Home Visit',
      'Bird Photography (over 180 species)',
      'Water Buffalo & Crocodile Spotting',
      'Jeep Safari at Sunrise',
      'Reservoir Boat Trip',
    ],
    highlights: [
      'Best park in Sri Lanka for elephant sightings',
      'Elephant Transit Home rehabilitation centre',
      'Open grassland habitat ideal for daytime wildlife viewing',
      'Over 180 resident bird species',
      'Easy access from Colombo and the south coast',
    ],
    budgetRange: 'LKR 25,000 - 50,000',
    rating: 4.7,
  },

  // ─── Adventure ────────────────────────────────────────────────────────────────
  {
    id: 'dest-arugam-bay',
    name: 'Arugam Bay',
    category: 'Adventure',
    location: 'Ampara District, Eastern Province',
    description:
      'Tucked along the sun-drenched eastern coast, Arugam Bay is a legendary surf destination whose main right-hand point break is consistently rated among Asia\'s top ten waves. The relaxed, barefoot vibe attracts an international crowd of surfers, kite-boarders, and nature enthusiasts who also come to explore the adjacent Kumana National Park, spot elephants on the nearby Lahugala plains, and kayak through the mangrove-lined lagoon.',
    image: arugamBayImg,
    bestTimeToVisit: 'May – September',
    activities: [
      'Surfing at Main Point',
      'Kite Surfing',
      'Lagoon Kayaking & Mangrove Safari',
      'Kumana National Park Safari',
      'Elephant Spotting at Lahugala',
      'Beach Yoga & Wellness Retreats',
    ],
    highlights: [
      'World-class right-hand point break surf',
      'Kumana National Park – rare birds & wildlife',
      'Lahugala Kitulana – largest natural lake in Eastern Province',
      'Vibrant international surf community',
      'Pristine, uncrowded eastern beaches',
    ],
    budgetRange: 'LKR 25,000 - 50,000',
    rating: 4.7,
  },
  {
    id: 'dest-adams-peak',
    name: "Adam's Peak (Sri Pada)",
    category: 'Adventure',
    location: 'Ratnapura & Nuwara Eliya Districts, Sabaragamuwa Province',
    description:
      'Standing at 2,243 metres, Adam\'s Peak is sacred to four of the world\'s great religions, each with their own name for the mysterious footprint-shaped depression at the summit – Sri Pada to Buddhists, Shiva Padam to Hindus, Adam\'s Peak to Muslims, and Mount of Adam\'s Foot to Christians. The pre-dawn pilgrimage climb up more than 5,500 steps is a deeply moving experience, culminating in one of the most stunning sunrises on the planet.',
    image: adamsPeakImg,
    bestTimeToVisit: 'December – May',
    activities: [
      'Night Pilgrimage Climb',
      'Summit Sunrise Watching',
      'Waterfall Trail to Laxapana Falls',
      'Ratnapura Gem Market Visit',
      'Sinharaja Rainforest Day Trip',
      'Tea Plantation Walk',
    ],
    highlights: [
      'Sacred to Buddhism, Hinduism, Islam, and Christianity',
      'Chain of lights visible from great distances during season',
      'Breathtaking triangular shadow cast at sunrise',
      '5,500+ steps – a true pilgrimage experience',
      'Spectacular views across the Central Highlands',
    ],
    budgetRange: 'LKR 10,000 - 25,000',
    rating: 4.9,
  },

  // ─── Nature ───────────────────────────────────────────────────────────────────
  {
    id: 'dest-horton-plains',
    name: 'Horton Plains National Park',
    category: 'Nature',
    location: 'Nuwara Eliya District, Central Province',
    description:
      'Occupying a windswept plateau at an altitude of 2,100–2,300 metres, Horton Plains is a UNESCO Biosphere Reserve of extraordinary biodiversity. The park\'s most dramatic feature – World\'s End – is a sheer escarpment dropping nearly 900 metres straight into the lowland jungle below. On clear mornings the view stretches all the way to the southern coastline, while the surrounding cloud forest shelters elusive leopards, sambar deer, and the endemic purple-faced langur monkey.',
    image: hortonPlainsImg,
    bestTimeToVisit: 'February – April & August – September',
    activities: [
      'World\'s End Cliff Hike',
      'Baker\'s Falls Trail',
      'Cloud Forest Birdwatching',
      'Sambar Deer Spotting',
      'Photography at Sunrise',
      'Guided Nature Walk',
    ],
    highlights: [
      'World\'s End – 900 m sheer cliff drop',
      'UNESCO Biosphere Reserve',
      'Highest plateau in Sri Lanka',
      'Baker\'s Falls – picturesque 20 m waterfall',
      'Endemic flora including Rhododendron arboreum',
    ],
    budgetRange: 'LKR 25,000 - 50,000',
    rating: 4.7,
  },
];
