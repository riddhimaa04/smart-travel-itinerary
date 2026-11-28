/* =====================================================
   data.js - the sample destination data (our small "dataset")

   Each destination is an object with these properties:
     id          short unique name used in web addresses
     name        destination name
     region      state / area
     type        Mountains, Beaches, Adventure, Culture or Nature
     cost        estimated cost PER PERSON for a typical trip (in rupees)
     minDays     shortest ideal trip length (days)
     maxDays     longest ideal trip length (days)
     styles      travel styles it suits: relaxing, adventurous, sightseeing
     rating      rating out of 5 (sample value)
     featured    true = shown on the home page
     colors      two colours used for the card background
     tagline, description, bestTime, highlights   text for the details page
     activities  list of {name, category, cost}
     images      (optional) list of picture file names for the gallery

   NOTE: all values are sample data written by hand. They are not live prices.
   ===================================================== */

const destinations = [
  {
    id: "goa",
    name: "Goa",
    region: "West India",
    type: "Beaches",
    cost: 22000,
    minDays: 4,
    maxDays: 6,
    styles: [
      "relaxing",
      "adventurous"
    ],
    rating: 4.7,
    featured: true,
    colors: [
      "#0F766E",
      "#34D399"
    ],
    tagline: "Sun, sand and laid-back coastal vibes",
    description: "India's best-loved beach getaway blends golden shores, Portuguese-era heritage, lively markets and a relaxed food and music culture. Ideal for both slow beach days and active water sports.",
    bestTime: "November – February",
    highlights: [
      "Palolem & Baga beaches",
      "Old Goa churches",
      "Fort Aguada sunsets"
    ],
    activities: [
      {
        name: "Baga Beach water sports",
        category: "Adventure",
        cost: 2500
      },
      {
        name: "Old Goa heritage walk",
        category: "Sightseeing",
        cost: 600
      },
      {
        name: "Fort Aguada sunset",
        category: "Sightseeing",
        cost: 200
      },
      {
        name: "Local seafood trail",
        category: "Food",
        cost: 1500
      }
    ]
  },
  {
    id: "manali",
    name: "Manali",
    region: "Himachal Pradesh",
    type: "Mountains",
    cost: 18000,
    minDays: 4,
    maxDays: 5,
    styles: [
      "adventurous",
      "relaxing"
    ],
    rating: 4.6,
    featured: true,
    colors: [
      "#1D4ED8",
      "#7DD3FC"
    ],
    tagline: "Snow peaks, pine forests and mountain air",
    description: "A Himalayan hill town in the Beas valley, popular for snow views, river rafting, cafes and the gateway to Solang Valley and Rohtang Pass.",
    bestTime: "March – June, December – February",
    highlights: [
      "Solang Valley",
      "Hadimba Temple",
      "Old Manali cafes"
    ],
    activities: [
      {
        name: "Solang Valley snow activities",
        category: "Adventure",
        cost: 2200
      },
      {
        name: "Hadimba Temple visit",
        category: "Sightseeing",
        cost: 100
      },
      {
        name: "Beas river rafting",
        category: "Adventure",
        cost: 1200
      },
      {
        name: "Old Manali cafe hopping",
        category: "Food",
        cost: 900
      }
    ]
  },
  {
    id: "jaipur",
    name: "Jaipur",
    region: "Rajasthan",
    type: "Culture",
    cost: 16000,
    minDays: 3,
    maxDays: 4,
    styles: [
      "sightseeing"
    ],
    rating: 4.5,
    featured: true,
    colors: [
      "#B45309",
      "#FCD34D"
    ],
    tagline: "The Pink City of palaces and forts",
    description: "Jaipur showcases royal Rajasthan through grand forts, palaces and bustling bazaars, with rich cuisine and handicrafts at every turn.",
    bestTime: "October – March",
    highlights: [
      "Amber Fort",
      "City Palace",
      "Hawa Mahal"
    ],
    activities: [
      {
        name: "Amber Fort tour",
        category: "Sightseeing",
        cost: 500
      },
      {
        name: "City Palace & Jantar Mantar",
        category: "Sightseeing",
        cost: 700
      },
      {
        name: "Bapu Bazaar shopping",
        category: "Shopping",
        cost: 2000
      },
      {
        name: "Rajasthani thali dinner",
        category: "Food",
        cost: 800
      }
    ]
  },
  {
    id: "kerala",
    name: "Kerala Backwaters",
    region: "Kerala",
    type: "Nature",
    cost: 28000,
    minDays: 5,
    maxDays: 6,
    styles: [
      "relaxing",
      "sightseeing"
    ],
    rating: 4.8,
    featured: true,
    colors: [
      "#047857",
      "#A7F3D0"
    ],
    tagline: "Houseboats, palms and calm green waters",
    description: "Drift through Alleppey's palm-lined canals, taste coastal Kerala cuisine and explore tea hills and spice gardens nearby.",
    bestTime: "September – March",
    highlights: [
      "Alleppey houseboat",
      "Munnar tea gardens",
      "Ayurvedic wellness"
    ],
    activities: [
      {
        name: "Alleppey houseboat stay",
        category: "Stay",
        cost: 9000
      },
      {
        name: "Munnar tea garden visit",
        category: "Sightseeing",
        cost: 500
      },
      {
        name: "Kathakali performance",
        category: "Culture",
        cost: 400
      },
      {
        name: "Ayurvedic massage",
        category: "Wellness",
        cost: 2500
      }
    ]
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    region: "Uttarakhand",
    type: "Adventure",
    cost: 12000,
    minDays: 3,
    maxDays: 4,
    styles: [
      "adventurous",
      "relaxing"
    ],
    rating: 4.5,
    featured: false,
    colors: [
      "#0369A1",
      "#86EFAC"
    ],
    tagline: "Yoga capital and river adventure hub",
    description: "Set on the Ganges, Rishikesh pairs spiritual calm with rafting, bungee jumping, camping and riverside yoga retreats.",
    bestTime: "September – November, February – May",
    highlights: [
      "Ganga rafting",
      "Laxman Jhula",
      "Evening Ganga aarti"
    ],
    activities: [
      {
        name: "White-water rafting",
        category: "Adventure",
        cost: 1500
      },
      {
        name: "Morning yoga session",
        category: "Wellness",
        cost: 500
      },
      {
        name: "Ganga aarti at Triveni Ghat",
        category: "Culture",
        cost: 0
      },
      {
        name: "Riverside camping",
        category: "Stay",
        cost: 2000
      }
    ]
  },
  {
    id: "ladakh",
    name: "Leh – Ladakh",
    region: "Ladakh",
    type: "Adventure",
    cost: 42000,
    minDays: 6,
    maxDays: 8,
    styles: [
      "adventurous",
      "sightseeing"
    ],
    rating: 4.9,
    featured: true,
    colors: [
      "#7C2D12",
      "#FDBA74"
    ],
    tagline: "High passes, blue lakes and monasteries",
    description: "A high-altitude desert of dramatic passes, turquoise lakes and ancient monasteries. Best for road trips and trekkers; acclimatisation is essential.",
    bestTime: "May – September",
    highlights: [
      "Pangong Lake",
      "Nubra Valley",
      "Khardung La pass"
    ],
    activities: [
      {
        name: "Pangong Lake excursion",
        category: "Sightseeing",
        cost: 4500
      },
      {
        name: "Nubra Valley camel safari",
        category: "Adventure",
        cost: 1200
      },
      {
        name: "Thiksey Monastery visit",
        category: "Culture",
        cost: 300
      },
      {
        name: "Leh market and cafes",
        category: "Food",
        cost: 900
      }
    ]
  },
  {
    id: "udaipur",
    name: "Udaipur",
    region: "Rajasthan",
    type: "Culture",
    cost: 20000,
    minDays: 3,
    maxDays: 4,
    styles: [
      "relaxing",
      "sightseeing"
    ],
    rating: 4.6,
    featured: false,
    colors: [
      "#6D28D9",
      "#FBCFE8"
    ],
    tagline: "The romantic City of Lakes",
    description: "Lake Pichola, marble palaces and rooftop restaurants make Udaipur one of India's most romantic heritage cities.",
    bestTime: "October – March",
    highlights: [
      "City Palace",
      "Lake Pichola boat ride",
      "Sajjangarh sunset"
    ],
    activities: [
      {
        name: "City Palace tour",
        category: "Sightseeing",
        cost: 700
      },
      {
        name: "Lake Pichola boat ride",
        category: "Sightseeing",
        cost: 500
      },
      {
        name: "Rooftop lake-view dinner",
        category: "Food",
        cost: 1800
      },
      {
        name: "Sajjangarh sunset",
        category: "Sightseeing",
        cost: 150
      }
    ]
  },
  {
    id: "varanasi",
    name: "Varanasi",
    region: "Uttar Pradesh",
    type: "Culture",
    cost: 11000,
    minDays: 2,
    maxDays: 3,
    styles: [
      "sightseeing"
    ],
    rating: 4.4,
    featured: false,
    colors: [
      "#9A3412",
      "#FDE68A"
    ],
    tagline: "Timeless ghats and sacred rituals",
    description: "One of the world's oldest living cities, Varanasi is known for its ghats, evening Ganga aarti, narrow lanes and deep spiritual tradition.",
    bestTime: "October – March",
    highlights: [
      "Dashashwamedh Ghat aarti",
      "Sunrise boat ride",
      "Kashi Vishwanath area"
    ],
    activities: [
      {
        name: "Sunrise boat ride on the Ganga",
        category: "Sightseeing",
        cost: 600
      },
      {
        name: "Evening Ganga aarti",
        category: "Culture",
        cost: 0
      },
      {
        name: "Old city food walk",
        category: "Food",
        cost: 700
      },
      {
        name: "Sarnath day visit",
        category: "Sightseeing",
        cost: 400
      }
    ]
  },
  {
    id: "andaman",
    name: "Andaman Islands",
    region: "Andaman & Nicobar",
    type: "Beaches",
    cost: 38000,
    minDays: 5,
    maxDays: 7,
    styles: [
      "relaxing",
      "adventurous"
    ],
    rating: 4.8,
    featured: false,
    colors: [
      "#0E7490",
      "#67E8F9"
    ],
    tagline: "Crystal water, coral reefs and white sand",
    description: "Clear turquoise water, coral reefs and quiet beaches make the Andamans ideal for snorkelling, scuba diving and island hopping.",
    bestTime: "October – May",
    highlights: [
      "Radhanagar Beach",
      "Scuba at Havelock",
      "Cellular Jail"
    ],
    activities: [
      {
        name: "Scuba diving at Havelock",
        category: "Adventure",
        cost: 4500
      },
      {
        name: "Radhanagar Beach day",
        category: "Sightseeing",
        cost: 300
      },
      {
        name: "Cellular Jail light show",
        category: "Culture",
        cost: 300
      },
      {
        name: "Neil Island snorkelling",
        category: "Adventure",
        cost: 1800
      }
    ]
  },
  {
    id: "darjeeling",
    name: "Darjeeling",
    region: "West Bengal",
    type: "Mountains",
    cost: 14000,
    minDays: 3,
    maxDays: 4,
    styles: [
      "relaxing",
      "sightseeing"
    ],
    rating: 4.4,
    featured: false,
    colors: [
      "#166534",
      "#BEF264"
    ],
    tagline: "Tea estates with Kanchenjunga views",
    description: "A colonial-era hill town of tea estates, toy-train rides and sunrise views over Kanchenjunga from Tiger Hill.",
    bestTime: "March – May, October – December",
    highlights: [
      "Tiger Hill sunrise",
      "Toy train ride",
      "Happy Valley Tea Estate"
    ],
    activities: [
      {
        name: "Tiger Hill sunrise",
        category: "Sightseeing",
        cost: 800
      },
      {
        name: "Darjeeling Himalayan toy train",
        category: "Sightseeing",
        cost: 1200
      },
      {
        name: "Tea estate tasting tour",
        category: "Food",
        cost: 500
      },
      {
        name: "Himalayan Zoological Park",
        category: "Nature",
        cost: 250
      }
    ]
  }
];
