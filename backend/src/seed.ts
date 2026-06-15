import { INestApplicationContext } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users/schemas/user.schema';
import { Destination, DestinationDocument } from './destinations/schemas/destination.schema';
import { Package, PackageDocument } from './packages/schemas/package.schema';
import { Booking, BookingDocument } from './bookings/schemas/booking.schema';
import { Review, ReviewDocument } from './reviews/schemas/review.schema';
import { Role } from './common/enums/role.enum';
import { BookingStatus } from './common/enums/booking-status.enum';
import { PaymentStatus } from './common/enums/payment-status.enum';
import { TourStatus } from './common/enums/tour-status.enum';

export async function seedDatabase(app: INestApplicationContext) {
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const destinationModel = app.get<Model<DestinationDocument>>(getModelToken(Destination.name));
  const packageModel = app.get<Model<PackageDocument>>(getModelToken(Package.name));
  const bookingModel = app.get<Model<BookingDocument>>(getModelToken(Booking.name));
  const reviewModel = app.get<Model<ReviewDocument>>(getModelToken(Review.name));

  // Clear existing collections
  await Promise.all([
    userModel.deleteMany({}),
    destinationModel.deleteMany({}),
    packageModel.deleteMany({}),
    bookingModel.deleteMany({}),
    reviewModel.deleteMany({}),
  ]);

  console.log('Cleared database collections.');

  // Create Users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedCustomerPassword = await bcrypt.hash('tourist123', 10);
  const hashedGuidePassword = await bcrypt.hash('guide123', 10);

  const admin = await new userModel({
    name: 'Roshan Perera',
    email: 'admin@exploreceylon.lk',
    password: hashedPassword,
    role: Role.ADMIN,
    phoneNumber: '+94 77 123 4567',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    isActive: true,
  }).save();

  const touristDocs = [];
  // Default Customer for sandbox / demo login
  const defaultTourist = await new userModel({
    name: 'Alice Johnson',
    email: 'tourist@exploreceylon.lk',
    password: hashedCustomerPassword,
    role: Role.CUSTOMER,
    phoneNumber: '+94 71 987 6500',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    isActive: true,
  }).save();
  touristDocs.push(defaultTourist);

  for (let i = 1; i <= 10; i++) {
    const tourist = await new userModel({
      name: `Customer ${i}`,
      email: `tourist${i}@exploreceylon.lk`,
      password: hashedCustomerPassword,
      role: Role.CUSTOMER,
      phoneNumber: `+94 71 987 650${i % 10}`,
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isActive: true,
    }).save();
    touristDocs.push(tourist);
  }

  const guideDocs = [];
  // Default Guide for sandbox / demo login
  const defaultGuide = await new userModel({
    name: 'Dilan Silva',
    email: 'guide@exploreceylon.lk',
    password: hashedGuidePassword,
    role: Role.TOUR_GUIDE,
    phoneNumber: '+94 72 345 6700',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isActive: true,
  }).save();
  guideDocs.push(defaultGuide);

  for (let i = 1; i <= 3; i++) {
    const guide = await new userModel({
      name: `Guide ${i}`,
      email: `guide${i}@exploreceylon.lk`,
      password: hashedGuidePassword,
      role: Role.TOUR_GUIDE,
      phoneNumber: `+94 72 345 670${i % 10}`,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      isActive: true,
    }).save();
    guideDocs.push(guide);
  }

  console.log(`Seeded Users: 1 Admin, ${touristDocs.length} Customers, ${guideDocs.length} Tour Guides.`);

  // Create 15 Destinations using local asset paths
  const destData = [
    {
      key: 'sigiriya',
      name: 'Sigiriya Rock Fortress',
      category: 'Heritage',
      location: 'Matale District, Central Province',
      description: 'Rising almost 200 metres above the surrounding jungle, Sigiriya is a breathtaking ancient citadel carved into a volcanic rock column by King Kashyapa in the 5th century. The climb rewards visitors with panoramic views, vivid frescoes of celestial maidens painted into the cliff face, and the legendary Mirror Wall etched with verses over a thousand years old.',
      image: '/src/assets/destinations/sigiriya.png',
      bestTimeToVisit: 'January – April',
      activities: ['Rock Climbing & Summit Trek', 'Fresco Gallery Tour', 'Mirror Wall Walk', 'Water Garden Exploration', 'Museum Visit', 'Photography'],
      highlights: ['UNESCO World Heritage Site', '5th-century royal palace ruins', 'Iconic Sigiriya Frescoes', 'Ancient hydraulic water gardens', 'Panoramic views of the Central Province'],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.9,
    },
    {
      key: 'galle',
      name: 'Galle Fort',
      category: 'Heritage',
      location: 'Galle District, Southern Province',
      description: 'Built by the Portuguese in the 16th century and later expanded by Dutch colonisers, Galle Fort is a remarkably intact example of colonial coastal fortification blended with South Asian architectural traditions. Inside its ramparts you will find cobblestone streets lined with boutique hotels, art galleries, spice shops, and charming cafés, all overlooking the turquoise Indian Ocean.',
      image: '/src/assets/destinations/galle.png',
      bestTimeToVisit: 'November – April',
      activities: ['Fort Rampart Walk at Sunset', 'Lighthouse Photography', 'Boutique Shopping', 'Local Café Hopping', 'Maritime Museum Tour', 'Whale Watching Boat Trips'],
      highlights: ['UNESCO World Heritage Site', 'Best-preserved colonial fort in South Asia', 'Dutch Reformed Church (1755)', 'Galle Lighthouse – oldest in Sri Lanka', 'Vibrant arts and craft scene'],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.7,
    },
    {
      key: 'anuradhapura',
      name: 'Sacred City of Anuradhapura',
      category: 'Heritage',
      location: 'Anuradhapura District, North Central Province',
      description: 'For over a thousand years Anuradhapura served as the capital of ancient Sri Lanka, and its sprawling archaeological zone preserves colossal brick dagobas, ornate moonstones, and palatial ruins that reflect the height of classical Sinhalese civilisation. The revered Jaya Sri Maha Bodhi tree – a cutting of the original Bodhi tree under which the Buddha attained enlightenment – has been tended here continuously for over 2,200 years.',
      image: '/src/assets/destinations/anuradhapura.png',
      bestTimeToVisit: 'May – September',
      activities: ['Ruwanwelisaya Stupa Pilgrimage', 'Jaya Sri Maha Bodhi Offering', 'Cycling Through the Archaeological Zone', 'Jetavanarama Museum Tour', 'Isurumuniya Rock Temple Exploration', 'Sunset at Tissa Wewa Reservoir'],
      highlights: ['UNESCO World Heritage Site', 'Jaya Sri Maha Bodhi – world\'s oldest documented tree', 'Massive Ruwanwelisaya Dagoba', 'Jetavanarama – once the world\'s third-tallest structure', 'Over 2,500 years of continuous civilisation'],
      budgetRange: 'LKR 10,000 - 25,000',
      rating: 4.8,
    },
    {
      key: 'polonnaruwa',
      name: 'Ancient City of Polonnaruwa',
      category: 'Heritage',
      location: 'Polonnaruwa District, North Central Province',
      description: 'Flourishing as Sri Lanka\'s second medieval capital from the 11th to 13th centuries, Polonnaruwa is a compact and well-preserved complex of royal palaces, Hindu temples, magnificent stupas, and serene Buddha statues carved directly into the rock. The iconic Gal Vihara – four colossal Buddha figures sculpted from a single granite face – is considered one of the finest examples of ancient rock-relief art in Asia.',
      image: '/src/assets/destinations/polonnaruwa.png',
      bestTimeToVisit: 'May – September',
      activities: ['Gal Vihara Rock Sculpture Tour', 'Cycling the Ruins Circuit', 'Parakrama Samudra Lake Walk', 'Rankoth Vehera Stupa Visit', 'Royal Palace Complex Exploration', 'Quadrangle Sacred Area Tour'],
      highlights: ['UNESCO World Heritage Site', 'Gal Vihara – magnificent rock-carved Buddha statues', 'Parakrama Samudra – ancient irrigation marvel', 'Well-preserved medieval city layout', 'Rich mix of Buddhist and Hindu architecture'],
      budgetRange: 'LKR 10,000 - 25,000',
      rating: 4.8,
    },
    {
      key: 'kandy',
      name: 'Sacred City of Kandy',
      category: 'Culture',
      location: 'Kandy District, Central Province',
      description: 'Nestled in a mountain valley and cradled by misty peaks, Kandy is the cultural heartbeat of Sri Lanka. The city centres on the Sri Dalada Maligawa – Temple of the Sacred Tooth Relic – one of Buddhism\'s most venerated shrines. Every August, the dazzling Esala Perahera procession fills the streets with adorned elephants, costumed dancers, fire performers, and thousands of pilgrims in a spectacle unlike any other.',
      image: '/src/assets/destinations/kandy.png',
      bestTimeToVisit: 'December – April',
      activities: ['Temple of the Tooth Relic Visit', 'Kandy Lake Evening Stroll', 'Kandyan Cultural Dance Show', 'Royal Botanical Gardens Tour', 'Udawatta Kele Sanctuary Birdwatching', 'Tea Museum Tour'],
      highlights: ['UNESCO World Heritage Site', 'Sri Dalada Maligawa – sacred tooth relic', 'Annual Esala Perahera festival (August)', 'Royal Botanical Gardens Peradeniya', 'Gateway to the hill country'],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.8,
    },
    {
      key: 'mirissa',
      name: 'Mirissa Beach',
      category: 'Beach',
      location: 'Matara District, Southern Province',
      description: 'Sheltered by a lush headland and fringed with swaying coconut palms, Mirissa is a crescent-shaped paradise where the southern coast\'s warmest waters meet world-class surf. From November through April the bay is also one of the planet\'s premier whale-watching locations, with blue whales and spinner dolphins frequently spotted just kilometres offshore.',
      image: '/src/assets/destinations/mirissa.png',
      bestTimeToVisit: 'November – April',
      activities: ['Blue Whale & Dolphin Watching', 'Surfing & Bodyboarding', 'Coconut Tree Hill Sunrise', 'Snorkelling', 'Beachfront Dining & Night Markets', 'Fishing Village Tour'],
      highlights: ['One of the world\'s top whale-watching spots', 'Pristine crescent beach', 'Iconic Coconut Tree Hill', 'Laid-back beach bar culture', 'Accessible from Galle and Matara'],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.7,
    },
    {
      key: 'bentota',
      name: 'Bentota Beach & River',
      category: 'Beach',
      location: 'Galle District, Southern Province',
      description: 'Stretching along a narrow peninsula between the Indian Ocean and the tranquil Bentota River, this twin-faced resort destination offers golden sandy beaches on one side and serene mangrove lagoons on the other. Bentota is internationally known as Sri Lanka\'s watersports capital, while its river corridor shelters rare species of monitor lizards, crocodiles, and nesting sea turtles.',
      image: '/src/assets/destinations/bentota.png',
      bestTimeToVisit: 'November – April',
      activities: ['Jet Skiing & Windsurfing', 'Banana Boat Rides', 'Mangrove River Safari', 'Sea Turtle Hatchery Visit', 'Brief Garden – Geoffrey Bawa Tour', 'Snorkelling at Hikkaduwa Reef'],
      highlights: ['Sri Lanka\'s premier watersports hub', 'Bentota River mangrove ecosystem', 'Sea turtle conservation hatcheries', 'Geoffrey Bawa\'s legendary Brief Garden', 'Tranquil resort atmosphere'],
      budgetRange: 'LKR 50,000 - 100,000',
      rating: 4.5,
    },
    {
      key: 'hikkaduwa',
      name: 'Hikkaduwa',
      category: 'Beach',
      location: 'Galle District, Southern Province',
      description: 'Long celebrated as Sri Lanka\'s original beach escape, Hikkaduwa pairs a vibrant reef ecosystem with a lively café and surf culture. The shallow Hikkaduwa Coral Sanctuary teems with sea turtles, parrotfish, and moray eels, making it one of the country\'s most accessible snorkelling experiences. After dark the town transforms into a buzzing strip of rooftop bars and seafood grills.',
      image: '/src/assets/destinations/hikkaduwa.png',
      bestTimeToVisit: 'November – April',
      activities: ['Coral Sanctuary Snorkelling', 'Surfing at Narigama', 'Glass-bottom Boat Reef Tour', 'Scuba Diving', 'Turtle Watching', 'Beachside Seafood Dining'],
      highlights: ['Hikkaduwa Coral Reef National Park', 'Resident sea turtles on the beach', 'Diverse surf breaks for all levels', 'Vibrant nightlife and beach bars', 'Only 100 km from Colombo'],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.5,
    },
    {
      key: 'ella',
      name: 'Scenic Ella Highlands',
      category: 'Hill Country',
      location: 'Badulla District, Uva Province',
      description: 'Draped across a ridge in the Uva Highlands, Ella is a place of extraordinary natural drama where emerald tea plantations cascade into deep gorges and cloud-laden peaks rise on every horizon. The village itself is small but brimming with character – boutique cafés, yoga studios, and rock-climbing walls reflect the mix of backpackers and wellness travellers drawn here by its legendary scenic train ride and trekking trails.',
      image: '/src/assets/destinations/ella.png',
      bestTimeToVisit: 'January – May',
      activities: ['Little Adam\'s Peak Sunrise Hike', 'Nine Arch Bridge Walk', 'Ravana Falls Swimming', 'Tea Estate & Factory Tour', 'Scenic Train Ride from Kandy', 'Rock Climbing at Ella Rock'],
      highlights: ['Nine Arch Bridge – Sri Lanka\'s most photographed landmark', 'Ella Gap viewpoint panorama', 'World\'s most scenic train journey (Kandy–Ella)', 'Little Adam\'s Peak easy hike', 'Ravana Falls and Ravana Cave'],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.8,
    },
    {
      key: 'nuwara-eliya',
      name: 'Nuwara Eliya',
      category: 'Hill Country',
      location: 'Nuwara Eliya District, Central Province',
      description: 'Perched at nearly 2,000 metres above sea level, Nuwara Eliya earns its nickname "Little England" through its colonial-era bungalows, manicured rose gardens, misty cricket grounds, and the refreshingly cool climate that surprises first-time visitors to tropical Sri Lanka. Vast carpets of tea bushes rolling across the surrounding hills produce some of the finest high-grown Ceylon teas in the world.',
      image: '/src/assets/destinations/nuwara-eliya.png',
      bestTimeToVisit: 'March – May',
      activities: ['Tea Estate & Factory Tour', 'Gregory Lake Boating & Zip-lining', 'Horton Plains Day Trip', 'Victoria Park Birdwatching', 'Hakgala Botanical Gardens Visit', 'Golf at Nuwara Eliya Golf Club'],
      highlights: ['Highest city in Sri Lanka (1,868 m)', 'World-renowned high-grown Ceylon tea', 'Colonial-era architecture and gardens', 'Gregory Lake – popular picnic and recreation spot', 'Gateway to Horton Plains National Park'],
      budgetRange: 'LKR 50,000 - 100,000',
      rating: 4.6,
    },
    {
      key: 'yala',
      name: 'Yala National Park',
      category: 'Wildlife',
      location: 'Hambantota & Monaragala Districts, Southern Province',
      description: 'Spanning over 97,000 hectares of dry monsoon forest, scrubland, and coastal wetlands, Yala is Sri Lanka\'s most famous wildlife sanctuary and home to the highest density of leopards anywhere on Earth. The park\'s diverse mosaic of habitats supports a staggering assembly of fauna – from massive bull elephants and lumbering sloth bears to saltwater crocodiles and an extraordinary 215 species of birds.',
      image: '/src/assets/destinations/yala.png',
      bestTimeToVisit: 'February – June',
      activities: ['4×4 Jungle Safari', 'Leopard & Elephant Spotting', 'Bird Photography', 'Sithulpawwa Rock Temple Visit', 'Buttuwa Lagoon Walk', 'Coastal Camping'],
      highlights: ['Highest leopard density in the world', 'Large resident elephant herds', 'Over 215 bird species including painted storks', 'Spectacular coastal landscapes within the park', 'Sithulpawwa ancient rock temple'],
      budgetRange: 'LKR 50,000 - 100,000',
      rating: 4.9,
    },
    {
      key: 'udawalawe',
      name: 'Udawalawe National Park',
      category: 'Wildlife',
      location: 'Ratnapura & Hambantota Districts',
      description: 'Centred on a vast reservoir fed by the Walawe River, Udawalawe is Sri Lanka\'s most elephant-friendly park and arguably the best place on the island for guaranteed close encounters with wild elephants. Herds of up to 50 individuals graze the open grasslands throughout the day, while the neighbouring Elephant Transit Home rehabilitates orphaned calves and releases them back into the wild.',
      image: '/src/assets/destinations/udawalawe.png',
      bestTimeToVisit: 'June – September & December – March',
      activities: ['Elephant Herd Safari', 'Elephant Transit Home Visit', 'Bird Photography (over 180 species)', 'Water Buffalo & Crocodile Spotting', 'Jeep Safari at Sunrise', 'Reservoir Boat Trip'],
      highlights: ['Best park in Sri Lanka for elephant sightings', 'Elephant Transit Home rehabilitation centre', 'Open grassland habitat ideal for daytime wildlife viewing', 'Over 180 resident bird species', 'Easy access from Colombo and the south coast'],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.7,
    },
    {
      key: 'arugam-bay',
      name: 'Arugam Bay',
      category: 'Adventure',
      location: 'Ampara District, Eastern Province',
      description: 'Tucked along the sun-drenched eastern coast, Arugam Bay is a legendary surf destination whose main right-hand point break is consistently rated among Asia\'s top ten waves. The relaxed, barefoot vibe attracts an international crowd of surfers, kite-boarders, and nature enthusiasts who also come to explore the adjacent Kumana National Park, spot elephants on the nearby Lahugala plains, and kayak through the mangrove-lined lagoon.',
      image: '/src/assets/destinations/arugam-bay.jpg',
      bestTimeToVisit: 'May – September',
      activities: ['Surfing at Main Point', 'Kite Surfing', 'Lagoon Kayaking & Mangrove Safari', 'Kumana National Park Safari', 'Elephant Spotting at Lahugala', 'Beach Yoga & Wellness Retreats'],
      highlights: ['World-class right-hand point break surf', 'Kumana National Park – rare birds & wildlife', 'Lahugala Kitulana – largest natural lake in Eastern Province', 'Vibrant international surf community', 'Pristine, uncrowded eastern beaches'],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.7,
    },
    {
      key: 'adams-peak',
      name: "Adam's Peak (Sri Pada)",
      category: 'Adventure',
      location: 'Ratnapura & Nuwara Eliya Districts, Sabaragamuwa Province',
      description: 'Standing at 2,243 metres, Adam\'s Peak is sacred to four of the world\'s great religions, each with their own name for the mysterious footprint-shaped depression at the summit – Sri Pada to Buddhists, Shiva Padam to Hindus, Adam\'s Peak to Muslims, and Mount of Adam\'s Foot to Christians. The pre-dawn pilgrimage climb up more than 5,500 steps is a deeply moving experience, culminating in one of the most stunning sunrises on the planet.',
      image: '/src/assets/destinations/adams-peak.png',
      bestTimeToVisit: 'December – May',
      activities: ['Night Pilgrimage Climb', 'Summit Sunrise Watching', 'Waterfall Trail to Laxapana Falls', 'Ratnapura Gem Market Visit', 'Sinharaja Rainforest Day Trip', 'Tea Plantation Walk'],
      highlights: ['Sacred to Buddhism, Hinduism, Islam, and Christianity', 'Chain of lights visible from great distances during season', 'Breathtaking triangular shadow cast at sunrise', '5,500+ steps – a true pilgrimage experience', 'Spectacular views across the Central Highlands'],
      budgetRange: 'LKR 10,000 - 25,000',
      rating: 4.9,
    },
    {
      key: 'horton-plains',
      name: 'Horton Plains National Park',
      category: 'Nature',
      location: 'Nuwara Eliya District, Central Province',
      description: 'Occupying a windswept plateau at an altitude of 2,100–2,300 metres, Horton Plains is a UNESCO Biosphere Reserve of extraordinary biodiversity. The park\'s most dramatic feature – World\'s End – is a sheer escarpment dropping nearly 900 metres straight into the lowland jungle below. On clear mornings the view stretches all the way to the southern coastline, while the surrounding cloud forest shelters elusive leopards, sambar deer, and the endemic purple-faced langur monkey.',
      image: '/src/assets/destinations/horton-plains.png',
      bestTimeToVisit: 'February – April & August – September',
      activities: ['World\'s End Cliff Hike', 'Baker\'s Falls Trail', 'Cloud Forest Birdwatching', 'Sambar Deer Spotting', 'Photography at Sunrise', 'Guided Nature Walk'],
      highlights: ['World\'s End – 900 m sheer cliff drop', 'UNESCO Biosphere Reserve', 'Highest plateau in Sri Lanka', 'Baker\'s Falls – picturesque 20 m waterfall', 'Endemic flora including Rhododendron arboreum'],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.7,
    },
  ];

  const savedDestinations: Record<string, DestinationDocument> = {};
  for (const dest of destData) {
    const savedDest = await new destinationModel({
      name: dest.name,
      category: dest.category,
      location: dest.location,
      description: dest.description,
      image: dest.image,
      rating: dest.rating,
      bestTimeToVisit: dest.bestTimeToVisit,
      activities: dest.activities,
      highlights: dest.highlights,
      budgetRange: dest.budgetRange,
    }).save();
    savedDestinations[dest.key] = savedDest;
  }

  console.log(`Seeded ${destData.length} Destinations.`);

  // Create 8 Packages linking to destinations with local image paths
  const packagesData = [
    {
      destinationKey: 'sigiriya',
      title: 'Sigiriya Cultural Fortress Tour',
      description: 'Immerse yourself in Sri Lankan history by climbing the ancient Lion Rock Fortress of Sigiriya, exploring Kandy, and visiting the cave temples of Dambulla.',
      duration: '3 Days',
      price: 249,
      maxPeople: 12,
      image: '/src/assets/destinations/sigiriya.png',
      highlights: [
        'UNESCO World Heritage Site',
        '5th-century royal palace ruins',
        'Iconic Sigiriya Frescoes',
        'Ancient hydraulic water gardens'
      ],
      includedServices: [
        '3-Star Hotel Stay with Breakfast',
        'All Entry Tickets (Sigiriya & Dambulla)',
        'Professional Sri Lankan Tour Guide',
        'Air-conditioned Private Transport'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival and Dambulla Cave Temple',
          description: 'Pick up from airport/hotel and drive to Dambulla. Explore the world-famous golden cave temple complex dating back to the 1st century BC. Check-in to hotel in Sigiriya.'
        },
        {
          day: 2,
          title: 'Sigiriya Fortress Climb & Village Tour',
          description: 'Morning climb of the breathtaking Sigiriya Rock Fortress. In the afternoon, enjoy a traditional catamaran ride and authentic Sri Lankan lunch in a local village.'
        },
        {
          day: 3,
          title: 'Kandy Transit & Departure',
          description: 'Drive to Kandy. Visit the sacred Temple of the Tooth Relic and stroll around Kandy Lake. Drop off at the airport or next destination.'
        }
      ]
    },
    {
      destinationKey: 'ella',
      title: 'Scenic Ella Tea Trails & Hikes',
      description: 'Explore the green heart of Sri Lanka. Walk across the iconic Nine Arch Bridge, hike Little Adam\'s Peak, and enjoy a scenic train ride through tea plantations.',
      duration: '4 Days',
      price: 179,
      maxPeople: 15,
      image: '/src/assets/destinations/ella.png',
      highlights: [
        'Nine Arch Bridge train photo',
        'Little Adams Peak easy hike',
        'Ceylon Tea Factory private tour'
      ],
      includedServices: [
        'Cozy Boutique Guest House Accommodation',
        'Train Ticket (Nanu Oya to Ella Scenic Route)',
        'Local Guide for Hikes',
        'Breakfast and Tea Plantation Tour Entrance'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Ella & Little Adam\'s Peak',
          description: 'Check-in to your guest house in Ella. Hike up Little Adam\'s Peak for a sunset view over the Ella Gap.'
        },
        {
          day: 2,
          title: 'Nine Arch Bridge and Ravana Falls',
          description: 'Morning walk along the railway tracks to witness the architectural marvel of Nine Arch Bridge. Afternoon visit to Ravana Falls for scenic views.'
        },
        {
          day: 3,
          title: 'Tea Factory Tour & Cooking Class',
          description: 'Visit a working Ceylon tea factory to learn the tea-making process. Evening Sri Lankan curry cooking masterclass.'
        },
        {
          day: 4,
          title: 'Scenic Train Experience & Departure',
          description: 'Board the famous blue train for a scenic ride to Nanu Oya through mist-laden tea gardens, concluding the tour.'
        }
      ]
    },
    {
      destinationKey: 'mirissa',
      title: 'Mirissa Blue Whale & Surf Safari',
      description: 'A coastal retreat featuring ocean excursions to spot the giant blue whales, surfing lessons on soft sandy breaks, and sunset cocktail dinners.',
      duration: '3 Days',
      price: 319,
      maxPeople: 10,
      image: '/src/assets/destinations/mirissa.png',
      highlights: [
        'Blue Whale Spotting',
        'Surf Lessons in Mirissa',
        'Seafood Sunset Dinner'
      ],
      includedServices: [
        'Beachfront Resort Stay (2 nights)',
        'Blue Whale Cruise Ticket with Safety Gear',
        'Surfing Lesson with Certified Instructor',
        'Seafood BBQ Buffet Dinner'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Welcome to Mirissa & Coconut Tree Hill',
          description: 'Check-in to the beach resort. Afternoon walk to Coconut Tree Hill for the quintessential Sri Lanka photo. Dinner on the beach.'
        },
        {
          day: 2,
          title: 'Whale Watching & Sunset Surf',
          description: 'Wake up early for a boat cruise into the Indian Ocean to spot blue whales and dolphins. 3:00 PM surf coaching session.'
        },
        {
          day: 3,
          title: 'Secret Beach Relaxation & Departure',
          description: 'Morning relaxation at Secret Beach. Swim in the shallow rock pools. Departure in the afternoon.'
        }
      ]
    },
    {
      destinationKey: 'yala',
      title: 'Wild Yala Leopard Safari & Glamping',
      description: 'Adventure deep into Yala National Park with professional wildlife guides and stay in a luxury tented glamping camp under the stars.',
      duration: '2 Days',
      price: 289,
      maxPeople: 6,
      image: '/src/assets/destinations/yala.png',
      highlights: [
        'Two Leopard Game Drives',
        'Luxury Wild Glamping Tent',
        'BBQ Jungle Dinner under Stars'
      ],
      includedServices: [
        'Luxury Glamping Tent with Ensuite Bathroom',
        'Two Full-Length 4x4 Jeep Safaris',
        'Wildlife Department Entry Fees',
        'BBQ Campfire Dinner & Drinks'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Camp Check-in & Afternoon Safari',
          description: 'Arrive at the glamping camp at noon. Lunch followed by a 4x4 safari looking for leopards, bears, and elephants. Night campfire dinner.'
        },
        {
          day: 2,
          title: 'Dawn Safari & Departure',
          description: 'Early morning game drive inside Yala Block 1. Return to camp for a hearty breakfast before checking out.'
        }
      ]
    },
    {
      destinationKey: 'galle',
      title: 'Galle Dutch Fort Heritage Walk',
      description: 'Explore the charming streets of Galle Dutch Fort, stay in a colonial heritage boutique house, and visit nearby turtle conservation centers.',
      duration: '2 Days',
      price: 139,
      maxPeople: 8,
      image: '/src/assets/destinations/galle.png',
      highlights: [
        'Fort Rampart Sunset Walk',
        'Turtle Hatchery Visit',
        'Dutch Reformed Church'
      ],
      includedServices: [
        'Heritage Hotel Stay in Galle Fort',
        'Guided Historical Walking Tour',
        'Entry tickets to Maritime Museum',
        'Traditional Rice & Curry Lunch'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Fort Exploration & Sunset Walk',
          description: 'Arrive in Galle. Take a guided walking tour of the ramparts, Dutch church, and lighthouse. Sunset walk along the sea wall.'
        },
        {
          day: 2,
          title: 'Shopping, Turtle Hatchery & Departure',
          description: 'Morning exploring art galleries and boutique shops. Drive to Kosgoda to release baby turtles at a conservation hatchery, then depart.'
        }
      ]
    },
    {
      destinationKey: 'arugam-bay',
      title: 'Arugam Bay Surf & Lagoon Adventure',
      description: 'A 5-day adventure combining the best surf spots in Sri Lanka with flatwater lagoon safaris and yoga sessions to recharge.',
      duration: '5 Days',
      price: 349,
      maxPeople: 10,
      image: '/src/assets/destinations/arugam-bay.jpg',
      highlights: [
        'Surf Sessions at Point Breaks',
        'Lagoon Wildlife Safari',
        'Daily Sunrise Yoga'
      ],
      includedServices: [
        'Cabana Stay near the Beach (4 nights)',
        '2x Guided Surf Trips to Point Breaks',
        'Lagoon Safari Boat Tour',
        'Daily Sunrise Yoga Classes'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrive and Sunset Surf Check',
          description: 'Check-in to your beach cabana. Evening sunset yoga followed by surf orientation at Baby Point.'
        },
        {
          day: 2,
          title: 'Surf Session & Crocodile Lagoon Safari',
          description: 'Morning surf session at Main Point. In the afternoon, take a boat through Kottukal Lagoon to spot crocodiles and eagles.'
        },
        {
          day: 3,
          title: 'Surf at Whiskey Point & Beach Party',
          description: 'Drive to Whiskey Point for a fun morning surf. Rest of the day free. Night beach BBQ and bonfire party.'
        },
        {
          day: 4,
          title: 'Kumana Safari Day Trip',
          description: 'Take a day excursion safari into Kumana National Park, famous for thousands of migratory birds and wild elephants.'
        },
        {
          day: 5,
          title: 'Farewell Yoga & Departure',
          description: 'Final morning yoga class, breakfast, and checkout.'
        }
      ]
    },
    {
      destinationKey: 'nuwara-eliya',
      title: 'Nuwara Eliya misty Hills Escape',
      description: 'Escape the heat in Little England. Enjoy high tea at a historic hotel, boat on Gregory Lake, and hike the spectacular Horton Plains.',
      duration: '3 Days',
      price: 209,
      maxPeople: 12,
      image: '/src/assets/destinations/nuwara-eliya.png',
      highlights: [
        'Horton Plains Hike to World End',
        'Gregory Lake Boating',
        'High Tea at Grand Hotel'
      ],
      includedServices: [
        'Colonial Bungalow Accommodation',
        'Horton Plains National Park Ticket & Guide',
        'High Tea Session at Grand Hotel Nuwara Eliya',
        'Lake Gregory Boating Passes'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Gregory Lake & City Walk',
          description: 'Arrive in Nuwara Eliya. Take a paddle boat ride on Gregory Lake and walk through Victoria Park. Afternoon High Tea at the Grand Hotel.'
        },
        {
          day: 2,
          title: 'Horton Plains World\'s End Hike',
          description: 'Very early morning departure for Horton Plains. Hike the 9.5km trail to see the 880m drop at World\'s End. Afternoon tea estate visit.'
        },
        {
          day: 3,
          title: 'Seetha Amman Temple & Departure',
          description: 'Visit the mythological Seetha Amman Temple and Hakgala Botanical Gardens before returning to Colombo.'
        }
      ]
    },
    {
      destinationKey: 'bentota',
      title: 'Bentota Luxury Watersports Getaway',
      description: 'Indulge in watersports on the Bentota lagoon, enjoy river safaris on Madu Ganga, and relax in a world-class beach resort.',
      duration: '3 Days',
      price: 279,
      maxPeople: 8,
      image: '/src/assets/destinations/bentota.png',
      highlights: [
        'Watersports on Lagoon',
        'Madu Ganga Boat Safari',
        'Ayurvedic Spa Treatment'
      ],
      includedServices: [
        '5-Star Beach Resort Stay',
        'Watersports Voucher (Jet Ski, Banana Boat)',
        'Madu River Mangrove Safari Boat',
        'Complimentary Spa Treatment'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Resort Check-in & Spa Session',
          description: 'Arrive at the luxury resort. Enjoy a 60-minute relaxing Ayurvedic massage at the spa. Rest of the day free on the beach.'
        },
        {
          day: 2,
          title: 'Madu Ganga Boat Safari & Watersports',
          description: 'Morning boat safari through Madu Ganga mangroves with fish therapy. Afternoon jet skiing and water tubing on the river.'
        },
        {
          day: 3,
          title: 'Brief Garden & Departure',
          description: 'Visit Brief Garden, the beautifully landscaped country home of architect Bevis Bawa. Checkout and departure.'
        }
      ]
    },
    {
      destinationKey: 'kandy',
      title: 'Kandy Royal Heritage & Tea Gardens',
      description: 'Explore the historic city of Kandy, visit the Temple of the Sacred Tooth Relic, stroll through the Royal Botanical Gardens, and enjoy traditional Kandyan dance performances.',
      duration: '3 Days',
      price: 189,
      maxPeople: 12,
      image: '/src/assets/destinations/kandy.png',
      highlights: [
        'Sacred Temple of the Tooth Relic',
        'Royal Botanical Gardens Peradeniya',
        'Kandyan Cultural Dance Show'
      ],
      includedServices: [
        '3-Star Hotel Stay with Breakfast',
        'All Temple & Garden Entry Tickets',
        'Private Tour Guide',
        'AC Transport'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Kandy & Temple Visit',
          description: 'Arrive in Kandy. Check-in to your hotel. Visit the Temple of the Tooth Relic in the evening to witness the traditional pooja ceremony.'
        },
        {
          day: 2,
          title: 'Botanical Gardens & Tea Museum',
          description: 'Spend the morning at the beautiful Royal Botanical Gardens. In the afternoon, visit the Ceylon Tea Museum and enjoy a cup of fresh Ceylon tea.'
        },
        {
          day: 3,
          title: 'City Tour, Cultural Dance & Departure',
          description: 'Take a city tour around Kandy Lake and local markets. Witness a Kandyan dance show. Departure in the afternoon.'
        }
      ]
    },
    {
      destinationKey: 'anuradhapura',
      title: 'Anuradhapura Sacred Stupas Pilgrimage',
      description: 'Journey back in time to Sri Lanka\'s first ancient capital. Explore massive brick stupas, ruins of monastic palaces, and the sacred Jaya Sri Maha Bodhi tree.',
      duration: '3 Days',
      price: 199,
      maxPeople: 10,
      image: '/src/assets/destinations/anuradhapura.png',
      highlights: [
        'Jaya Sri Maha Bodhi tree',
        'Colossal Ruwanwelisaya Stupa',
        'Cycling through the Sacred City'
      ],
      includedServices: [
        'Heritage Guesthouse Stay with Breakfast',
        'All Archaeological Site Entry Tickets',
        'Bicycle Rentals for Exploration',
        'Licensed Historical Guide'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Jaya Sri Maha Bodhi',
          description: 'Transfer to Anuradhapura. In the evening, visit the sacred Jaya Sri Maha Bodhi, the oldest human-planted tree in the world, and participate in local rituals.'
        },
        {
          day: 2,
          title: 'Ruwanwelisaya & Jetavanarama Exploration',
          description: 'Cycle around the archaeological zone. Marvel at the giant Ruwanwelisaya and the massive Jetavanarama stupas. Visit the Isurumuniya rock temple.'
        },
        {
          day: 3,
          title: 'Mihintale Peak & Departure',
          description: 'Visit Mihintale, the cradle of Buddhism in Sri Lanka. Climb the sacred hill for a panoramic view. Depart in the afternoon.'
        }
      ]
    },
    {
      destinationKey: 'polonnaruwa',
      title: 'Polonnaruwa Medieval Kingdom Cycling Tour',
      description: 'Discover the well-preserved ruins of Sri Lanka\'s medieval capital. Marvel at royal palaces, ancient temples, and the magnificent rock carvings of Gal Vihara.',
      duration: '3 Days',
      price: 179,
      maxPeople: 12,
      image: '/src/assets/destinations/polonnaruwa.png',
      highlights: [
        'Gal Vihara rock-carved Buddha statues',
        'Ancient Royal Palace of King Parakramabahu',
        'Cycling around archaeological ruins'
      ],
      includedServices: [
        'Boutique Hotel Stay with Breakfast',
        'All Archaeological Site Entry Passes',
        'Bicycle Rental & Safety Gear',
        'Local Tour Guide'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Parakrama Samudra Walk',
          description: 'Arrive in Polonnaruwa. Visit the archaeological museum and take a late afternoon walk along the banks of the massive Parakrama Samudra reservoir.'
        },
        {
          day: 2,
          title: 'Royal Palace ruins & Gal Vihara',
          description: 'Embark on a guided cycling tour. Explore the Royal Palace ruins, the Quadrangle sacred site, and the four magnificent rock-carved Buddhas of Gal Vihara.'
        },
        {
          day: 3,
          title: 'Girikanduruseya & Departure',
          description: 'Visit nearby historical sites or enjoy a scenic village walk. Return to hotel, checkout, and depart.'
        }
      ]
    },
    {
      destinationKey: 'hikkaduwa',
      title: 'Hikkaduwa Coral Reef & Snorkeling Holiday',
      description: 'Enjoy a vibrant beach getaway in Hikkaduwa. Snorkel with sea turtles in the coral sanctuary, scuba dive historic shipwrecks, and experience the lively nightlife.',
      duration: '3 Days',
      price: 229,
      maxPeople: 8,
      image: '/src/assets/destinations/hikkaduwa.png',
      highlights: [
        'Snorkeling in Hikkaduwa Coral Reef',
        'Resident sea turtle sightings on the beach',
        'Glass-bottom boat reef cruise'
      ],
      includedServices: [
        'Beachfront Resort Stay (2 nights)',
        'Snorkeling gear & Glass-bottom boat tickets',
        'Breakfast Buffet',
        'Seafood Beachfront Dinner'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Beach Check-in & Sunset Surf',
          description: 'Arrive at your beachfront resort in Hikkaduwa. Spend the afternoon relaxing on Narigama beach and watching the sunset.'
        },
        {
          day: 2,
          title: 'Snorkeling and Sea Turtles',
          description: 'Wake up early to swim and feed wild sea turtles that visit the shore. Embark on a glass-bottom boat tour to snorkel in the Coral Sanctuary.'
        },
        {
          day: 3,
          title: 'Tsunami Memorial & Departure',
          description: 'Visit the Tsunami Memorial and Museum in Peraliya. Spend your last hours shopping for local souvenirs before departing.'
        }
      ]
    },
    {
      destinationKey: 'udawalawe',
      title: 'Udawalawe Elephant Sanctuary & Safari',
      description: 'Get guaranteed up-close encounters with wild Sri Lankan elephants. Visit the Elephant Transit Home and enjoy an exciting jeep safari around the reservoir.',
      duration: '2 Days',
      price: 219,
      maxPeople: 8,
      image: '/src/assets/destinations/udawalawe.png',
      highlights: [
        'Guaranteed elephant herd sightings',
        'Elephant Transit Home feeding session',
        'Sunset 4x4 Jeep Safari'
      ],
      includedServices: [
        'Safari Lodge Stay (1 night)',
        'Full 4x4 Jeep Safari with Driver-Guide',
        'Park Entry Tickets & Transit Home donation',
        'All Meals Included'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Transit Home Visit & Sunset Safari',
          description: 'Arrive in Udawalawe. Visit the Elephant Transit Home to watch orphaned baby elephants being fed. Embark on an afternoon 4x4 safari.'
        },
        {
          day: 2,
          title: 'Sunrise Safari & Departure',
          description: 'Take a sunrise jeep safari to spot elephants, birds, and water buffaloes in the golden light. Return for breakfast and checkout.'
        }
      ]
    },
    {
      destinationKey: 'adams-peak',
      title: 'Adam\'s Peak Sunrise Pilgrimage Hike',
      description: 'Embark on a sacred overnight trek up Adam\'s Peak (Sri Pada). Climb 5,500+ steps along a lit trail to witness the spectacular sunrise and the sacred footprint.',
      duration: '2 Days',
      price: 149,
      maxPeople: 15,
      image: '/src/assets/destinations/adams-peak.png',
      highlights: [
        'Overnight climb of 5,500+ steps',
        'Breathtaking sunrise from the summit',
        'Multi-faith sacred footprint shrine'
      ],
      includedServices: [
        'Guesthouse Stay in Nallathanniya (day rest)',
        'Experienced local trekking guide',
        'Hot tea, snacks, and climbing support',
        'Roundtrip transport from Hatton station'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Hatton Transfer & Midnight Start',
          description: 'Pick up from Hatton station, transfer to Nallathanniya guesthouse to rest. Begin the overnight ascent at midnight guided by a string of lights.'
        },
        {
          day: 2,
          title: 'Summit Sunrise & Return Descent',
          description: 'Reach the summit before dawn. Witness the traditional oil lamp lighting and the spectacular sunrise. Descend, have breakfast, and transfer back.'
        }
      ]
    },
    {
      destinationKey: 'horton-plains',
      title: 'Horton Plains & World\'s End Scenic Trek',
      description: 'Hike across a windy high-altitude plateau, walk through mist-shrouded cloud forests, peer over the 900-meter sheer drop of World\'s End, and visit Baker\'s Falls.',
      duration: '2 Days',
      price: 169,
      maxPeople: 10,
      image: '/src/assets/destinations/horton-plains.png',
      highlights: [
        '9.5km trail trek inside Horton Plains',
        'World\'s End 900m vertical cliff drop',
        'Baker\'s Falls waterfall view'
      ],
      includedServices: [
        'Highland Lodge Accommodation (1 night)',
        'Horton Plains National Park Entry Passes',
        'Local nature guide for the trek',
        'Breakfast & trail lunch box'
      ],
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Nuwara Eliya & Trek Briefing',
          description: 'Arrive at the lodge near Horton Plains. Enjoy a brief nature walk around the lodge and a warm dinner with your guide.'
        },
        {
          day: 2,
          title: 'Early Morning Trek & Baker\'s Falls',
          description: 'Depart at 5:00 AM for Horton Plains. Hike the 9.5km circular loop, taking in World\'s End and Baker\'s Falls before returning for checkout.'
        }
      ]
    }
  ];

  const savedPackages: PackageDocument[] = [];


  for (const pkg of packagesData) {
    const destDoc = savedDestinations[pkg.destinationKey];
    if (!destDoc) continue;

    const savedPkg = await new packageModel({
      title: pkg.title,
      destination: destDoc._id,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      maxPeople: pkg.maxPeople,
      image: pkg.image,
      highlights: pkg.highlights,
      includedServices: pkg.includedServices,
      itinerary: pkg.itinerary,
    }).save();
    savedPackages.push(savedPkg);
  }

  console.log(`Seeded ${savedPackages.length} Packages.`);

  // Create 20 Bookings using random customers and packages
  if (savedPackages.length > 0 && touristDocs.length > 0) {
    for (let i = 0; i < 20; i++) {
      const randomPkg = savedPackages[Math.floor(Math.random() * savedPackages.length)];
      const randomCustomer = touristDocs[Math.floor(Math.random() * touristDocs.length)];
      const randomGuide = guideDocs[Math.floor(Math.random() * guideDocs.length)];
      const isConfirmed = Math.random() > 0.5;

      await new bookingModel({
        customer: randomCustomer._id,
        package: randomPkg._id,
        bookingDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
        travelDate: new Date(Date.now() + Math.floor(Math.random() * 10000000000)),
        totalAmount: randomPkg.price * 2,
        guestsCount: 2,
        paymentStatus: isConfirmed ? PaymentStatus.PAID : PaymentStatus.NOT_PAID,
        bookingStatus: isConfirmed ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
        tourStatus: TourStatus.UPCOMING,
        assignedGuide: isConfirmed ? randomGuide._id : undefined,
        approvedBy: isConfirmed ? admin._id : undefined,
        approvedAt: isConfirmed ? new Date() : undefined,
      }).save();
    }
    console.log('Seeded 20 Bookings.');
  }

  // Create Reviews
  if (savedDestinations['sigiriya'] && savedDestinations['yala'] && touristDocs.length > 0) {
    await new reviewModel({
      user: touristDocs[0]._id,
      destination: savedDestinations['sigiriya']._id,
      rating: 5,
      comment: 'Absolutely stunning! Climbing the rock is a workout but the view and historical frescoes are 100% worth it.',
    }).save();

    await new reviewModel({
      user: touristDocs[1]._id,
      destination: savedDestinations['yala']._id,
      rating: 4.5,
      comment: 'Awesome safari. We saw a leopard sitting right on a tree branch, elephants crossing the path, and lots of crocodiles.',
    }).save();

    console.log('Seeded Reviews.');
  }

  console.log('Database seeding process completed successfully!');
}
