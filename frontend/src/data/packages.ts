import type { Package } from '../types';
import sigiriyaImg from '../assets/destinations/sigiriya.png';
import ellaImg from '../assets/destinations/ella.png';
import mirissaImg from '../assets/destinations/mirissa.png';
import yalaImg from '../assets/destinations/yala.png';
import galleImg from '../assets/destinations/galle.png';
import arugamBayImg from '../assets/destinations/arugam-bay.jpg';
import nuwaraEliyaImg from '../assets/destinations/nuwara-eliya.png';
import bentotaImg from '../assets/destinations/bentota.png';
import kandyImg from '../assets/destinations/kandy.png';
import hikkaduwaImg from '../assets/destinations/hikkaduwa.png';
import anuradhapuraImg from '../assets/destinations/anuradhapura.png';
import polonnaruwaImg from '../assets/destinations/polonnaruwa.png';
import udawalaweImg from '../assets/destinations/udawalawe.png';
import adamsPeakImg from '../assets/destinations/adams-peak.png';
import hortonPlainsImg from '../assets/destinations/horton-plains.png';

export const mockPackages: Package[] = [
  {
    id: 'pkg-sigiriya',
    destinationId: 'dest-sigiriya',
    name: 'Sigiriya Cultural Fortress Tour',
    description: 'Immerse yourself in Sri Lankan history by climbing the ancient Lion Rock Fortress of Sigiriya, exploring Kandy, and visiting the cave temples of Dambulla.',
    image: sigiriyaImg,
    price: 249,
    durationDays: 3,
    maxGroupSize: 12,
    category: 'Heritage',
    rating: 4.9,
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
    id: 'pkg-ella',
    destinationId: 'dest-ella',
    name: 'Scenic Ella Tea Trails & Hikes',
    description: 'Explore the green heart of Sri Lanka. Walk across the iconic Nine Arch Bridge, hike Little Adam\'s Peak, and enjoy a scenic train ride through tea plantations.',
    image: ellaImg,
    price: 179,
    durationDays: 4,
    maxGroupSize: 15,
    category: 'Hill Country',
    rating: 4.8,
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
    id: 'pkg-mirissa',
    destinationId: 'dest-mirissa',
    name: 'Mirissa Blue Whale & Surf Safari',
    description: 'A coastal retreat featuring ocean excursions to spot the giant blue whales, surfing lessons on soft sandy breaks, and sunset cocktail dinners.',
    image: mirissaImg,
    price: 319,
    durationDays: 3,
    maxGroupSize: 10,
    category: 'Beach',
    rating: 4.7,
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
    id: 'pkg-yala',
    destinationId: 'dest-yala',
    name: 'Wild Yala Leopard Safari & Glamping',
    description: 'Adventure deep into Yala National Park with professional wildlife guides and stay in a luxury tented glamping camp under the stars.',
    image: yalaImg,
    price: 289,
    durationDays: 2,
    maxGroupSize: 6,
    category: 'Wildlife',
    rating: 4.9,
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
    id: 'pkg-galle',
    destinationId: 'dest-galle',
    name: 'Galle Dutch Fort Heritage Walk',
    description: 'Explore the charming streets of Galle Dutch Fort, stay in a colonial heritage boutique house, and visit nearby turtle conservation centers.',
    image: galleImg,
    price: 139,
    durationDays: 2,
    maxGroupSize: 8,
    category: 'Heritage',
    rating: 4.6,
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
    id: 'pkg-arugambay',
    destinationId: 'dest-arugam-bay',
    name: 'Arugam Bay Surf & Lagoon Adventure',
    description: 'A 5-day adventure combining the best surf spots in Sri Lanka with flatwater lagoon safaris and yoga sessions to recharge.',
    image: arugamBayImg,
    price: 349,
    durationDays: 5,
    maxGroupSize: 10,
    category: 'Adventure',
    rating: 4.8,
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
    id: 'pkg-nuwaraeliya',
    destinationId: 'dest-nuwara-eliya',
    name: 'Nuwara Eliya misty Hills Escape',
    description: 'Escape the heat in Little England. Enjoy high tea at a historic hotel, boat on Gregory Lake, and hike the spectacular Horton Plains.',
    image: nuwaraEliyaImg,
    price: 209,
    durationDays: 3,
    maxGroupSize: 12,
    category: 'Hill Country',
    rating: 4.7,
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
    id: 'pkg-bentota',
    destinationId: 'dest-bentota',
    name: 'Bentota Luxury Watersports Getaway',
    description: 'Indulge in watersports on the Bentota lagoon, enjoy river safaris on Madu Ganga, and relax in a world-class beach resort.',
    image: bentotaImg,
    price: 279,
    durationDays: 3,
    maxGroupSize: 8,
    category: 'Beach',
    rating: 4.5,
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

  // ─── Kandy ──────────────────────────────────────────────────────────────────
  {
    id: 'pkg-kandy',
    destinationId: 'dest-kandy',
    name: 'Sacred Kandy Cultural Experience',
    description: 'Immerse yourself in the cultural heartbeat of Sri Lanka. Visit the famous Temple of the Tooth Relic, explore the Royal Botanical Gardens, and experience an authentic Kandyan dance performance.',
    image: kandyImg,
    price: 189,
    durationDays: 3,
    maxGroupSize: 12,
    category: 'Culture',
    rating: 4.8,
    includedServices: [
      'Boutique Hotel Stay (2 nights)',
      'Temple of the Tooth Relic Entry Ticket',
      'Royal Botanical Gardens Peradeniya Visit',
      'Kandyan Cultural Dance Show Ticket',
      'Guided City Walk'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Temple of the Sacred Tooth',
        description: 'Arrive in Kandy and check-in to your boutique hotel. Visit the revered Sri Dalada Maligawa (Temple of the Tooth Relic) in the evening. Enjoy a sunset stroll around Kandy Lake.'
      },
      {
        day: 2,
        title: 'Botanical Gardens & Cultural Dance',
        description: 'Morning tour of the world-famous Royal Botanical Gardens in Peradeniya. Afternoon visit to the tea museum. Evening Kandyan cultural dance and fire-walking performance.'
      },
      {
        day: 3,
        title: 'City Walk & Departure',
        description: 'Explore the bustling Kandy Market and Gem Museum. Stroll around the lake one last time before departure to Colombo or your next destination.'
      }
    ]
  },

  // ─── Hikkaduwa ──────────────────────────────────────────────────────────────
  {
    id: 'pkg-hikkaduwa',
    destinationId: 'dest-hikkaduwa',
    name: 'Hikkaduwa Reef & Surf Weekend',
    description: 'Sri Lanka\'s original beach escape. Snorkel with sea turtles in the famous coral sanctuary, surf the legendary Narigama breaks, and enjoy fresh seafood in beachside restaurants.',
    image: hikkaduwaImg,
    price: 159,
    durationDays: 2,
    maxGroupSize: 10,
    category: 'Beach',
    rating: 4.5,
    includedServices: [
      'Beach Guesthouse Stay (1 night)',
      'Coral Reef Snorkelling with Equipment',
      'Glass-bottom Boat Reef Tour',
      'Surfing Lesson (1 hour)',
      'Seafood Dinner on the Beach'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Reef Snorkelling & Beach Afternoon',
        description: 'Arrive in Hikkaduwa. Morning snorkelling session at the Hikkaduwa Coral Sanctuary with sea turtles. Glass-bottom boat reef tour. Afternoon free for swimming and sunbathing. Seafood dinner on the beach.'
      },
      {
        day: 2,
        title: 'Surfing Lesson & Departure',
        description: 'Morning beginner surf lesson at Narigama Beach with certified instructors. Explore local craft stalls and shops. Checkout and departure in the afternoon.'
      }
    ]
  },

  // ─── Anuradhapura ───────────────────────────────────────────────────────────
  {
    id: 'pkg-anuradhapura',
    destinationId: 'dest-anuradhapura',
    name: 'Ancient Anuradhapura Heritage Trail',
    description: 'Walk through 2,500 years of history in Sri Lanka\'s ancient capital. Visit the world\'s oldest tree, majestic dagobas, and royal palace ruins that shaped Sinhalese civilisation.',
    image: anuradhapuraImg,
    price: 149,
    durationDays: 2,
    maxGroupSize: 15,
    category: 'Heritage',
    rating: 4.8,
    includedServices: [
      'Heritage Hotel Stay (1 night)',
      'Archaeological Zone Entry Tickets',
      'Certified Heritage Guide',
      'Bicycle Rental for Ruins Circuit',
      'Jaya Sri Maha Bodhi Visit'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Sacred Sites & Bodhi Tree Offering',
        description: 'Arrive in Anuradhapura and check-in. Visit the revered Jaya Sri Maha Bodhi – the world\'s oldest documented tree. Explore the Ruwanwelisaya Stupa and Jetavanarama complex. Evening at Tissa Wewa reservoir.'
      },
      {
        day: 2,
        title: 'Cycling the Ruins & Departure',
        description: 'Morning bicycle tour through the archaeological zone covering the Royal Palace, Isurumuniya Rock Temple, and the moonstone at Mahasena\'s Palace. Departure after lunch.'
      }
    ]
  },

  // ─── Polonnaruwa ────────────────────────────────────────────────────────────
  {
    id: 'pkg-polonnaruwa',
    destinationId: 'dest-polonnaruwa',
    name: 'Polonnaruwa Cycling Ruins Tour',
    description: 'Explore Sri Lanka\'s second medieval capital by bicycle. Visit the iconic Gal Vihara rock Buddha statues, the Royal Palace complex, and ancient irrigation marvels.',
    image: polonnaruwaImg,
    price: 139,
    durationDays: 2,
    maxGroupSize: 12,
    category: 'Heritage',
    rating: 4.7,
    includedServices: [
      'Heritage Guesthouse Stay (1 night)',
      'Ruins Archaeological Zone Entry',
      'Bicycle Rental (Full Day)',
      'Expert Heritage Guide',
      'Parakrama Samudra Lake Walk'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Gal Vihara & Royal Palace',
        description: 'Arrive in Polonnaruwa. Afternoon bicycle tour to Gal Vihara – the magnificent rock-carved Buddha statues. Explore the Royal Palace complex and the Quadrangle sacred area. Visit Parakrama Samudra ancient reservoir at sunset.'
      },
      {
        day: 2,
        title: 'Full Ruins Circuit & Departure',
        description: 'Early morning complete bicycle circuit covering Rankoth Vehera Stupa, Lotus Pond, Shiva Devale temples, and Statue of Parakramabahu. Departure in the afternoon.'
      }
    ]
  },

  // ─── Udawalawe ──────────────────────────────────────────────────────────────
  {
    id: 'pkg-udawalawe',
    destinationId: 'dest-udawalawe',
    name: 'Udawalawe Elephant Safari Camp',
    description: 'The best park in Sri Lanka for guaranteed elephant encounters. Watch herds of up to 50 wild elephants at the reservoir, visit the Elephant Transit Home, and enjoy a jeep safari at sunrise.',
    image: udawalaweImg,
    price: 229,
    durationDays: 2,
    maxGroupSize: 8,
    category: 'Wildlife',
    rating: 4.7,
    includedServices: [
      'Safari Lodge Stay (1 night)',
      'Two Jeep Safaris (Dawn & Afternoon)',
      'Elephant Transit Home Entry',
      'Wildlife Department Fees',
      'Bush Dinner & Bonfire'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Elephant Transit Home & Afternoon Safari',
        description: 'Arrive at the safari lodge. Morning visit to the Elephant Transit Home to watch orphaned calves being rehabilitated. Afternoon 4x4 jeep safari to spot wild elephant herds, water buffalo, and resident crocodiles. Bush dinner under the stars.'
      },
      {
        day: 2,
        title: 'Dawn Elephant Safari & Departure',
        description: 'Very early morning (5:30 AM) game drive to the reservoir where large elephant herds gather at sunrise. Return for breakfast and checkout. Photography opportunities throughout the morning.'
      }
    ]
  },

  // ─── Adam's Peak ────────────────────────────────────────────────────────────
  {
    id: 'pkg-adams-peak',
    destinationId: 'dest-adams-peak',
    name: "Adam's Peak Pilgrimage Climb",
    description: 'A sacred and awe-inspiring pre-dawn climb up 5,500+ steps to the summit of Adam\'s Peak. Witness one of Sri Lanka\'s most breathtaking sunrises, with the mountain\'s perfect triangular shadow stretching across the valley below.',
    image: adamsPeakImg,
    price: 119,
    durationDays: 2,
    maxGroupSize: 15,
    category: 'Adventure',
    rating: 4.9,
    includedServices: [
      'Pilgrim Guesthouse Stay near base (1 night)',
      'Experienced Pilgrimage Guide',
      'Torchlight & Safety Equipment',
      'Summit Breakfast Pack',
      'Sinharaja Rainforest Day Trip (optional)'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival at Base & Trail Preparation',
        description: 'Arrive at Dalhousie base village in the afternoon. Check-in to your guesthouse. Rest and prepare for the night climb. At midnight, begin the ascent along the illuminated stairway chain-lit by thousands of lanterns during the pilgrimage season.'
      },
      {
        day: 2,
        title: 'Summit Sunrise & Descent',
        description: 'Reach the summit just before dawn to experience the famous triangular shadow of Adam\'s Peak cast over the valley at sunrise. Meditation time at the sacred footprint shrine. Descend to base by mid-morning, followed by breakfast and departure.'
      }
    ]
  },

  // ─── Horton Plains ──────────────────────────────────────────────────────────
  {
    id: 'pkg-horton-plains',
    destinationId: 'dest-horton-plains',
    name: "Horton Plains World's End Trek",
    description: "Stand at the edge of World's End – a sheer 900-metre cliff drop in Sri Lanka's highest plateau. Hike through UNESCO-protected cloud forest, visit Baker's Falls, and spot endemic wildlife on this unforgettable highland trek.",
    image: hortonPlainsImg,
    price: 169,
    durationDays: 2,
    maxGroupSize: 10,
    category: 'Adventure',
    rating: 4.7,
    includedServices: [
      'Mountain Bungalow Stay in Nuwara Eliya (1 night)',
      'Horton Plains National Park Entry Fee',
      'Certified Wildlife & Nature Guide',
      'Trekking Map & Safety Briefing',
      "Baker's Falls & World's End Hike"
    ],
    itinerary: [
      {
        day: 1,
        title: 'Nuwara Eliya Arrival & High Tea',
        description: 'Arrive in Nuwara Eliya – Little England of Sri Lanka. Check-in to your mountain bungalow. Afternoon high tea at the iconic Grand Hotel. Evening preparation briefing for the next day\'s dawn hike.'
      },
      {
        day: 2,
        title: "World's End Cliff Trek & Baker's Falls",
        description: "Very early departure (5:30 AM) to Horton Plains before the mist rolls in. Hike the 9.5km circular trail: Baker's Falls waterfall → through cloud forest → World's End cliff for the dramatic 900m drop view. Return to Nuwara Eliya for lunch and departure."
      }
    ]
  }
];

