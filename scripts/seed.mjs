// Loads a few sample packages, vehicles and offers so the site is not empty on first run.
// Usage: npm run seed   (reads MONGODB_URI from .env.local)
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing. Create .env.local first (see .env.example).");
  process.exit(1);
}

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;
const now = new Date();
const stamp = (i = 0) => ({ createdAt: new Date(now - i * 60000), updatedAt: now, active: true });

const packages = [
  {
    title: "Goa Beach Escape",
    destination: "Goa",
    price: 14999,
    days: 4,
    nights: 3,
    description:
      "Sun, sand and slow mornings. Stay close to the beach, explore forts and spice markets, and watch the sunset from a quiet cove.",
    included: ["3 nights in a beachside hotel", "Daily breakfast", "Airport or station pickup and drop", "North and South Goa sightseeing by AC car"],
    excluded: ["Flights or train tickets", "Lunch and dinner", "Water sports", "Personal expenses"],
    images: [img("photo-1512343879784-a960bf40e7f2"), img("photo-1507525428034-b723cf961d3e")],
    featured: true,
  },
  {
    title: "Kerala Backwaters and Hills",
    destination: "Kerala",
    price: 22999,
    days: 6,
    nights: 5,
    description:
      "Tea gardens in Munnar, a night on a private houseboat in Alleppey and the wildlife of Thekkady, all in one relaxed route.",
    included: ["5 nights in hotels and a houseboat", "Breakfast, plus all meals on the houseboat", "Private AC vehicle with driver", "All toll and parking charges"],
    excluded: ["Flights", "Entry tickets", "Activities like elephant rides", "Tips"],
    images: [img("photo-1602216056096-3b40cc0c9944"), img("photo-1593693397690-362cb9666fc2")],
    featured: true,
  },
  {
    title: "Manali Snow Week",
    destination: "Manali",
    price: 18499,
    days: 5,
    nights: 4,
    description: "Snow at Solang, the Atal Tunnel to Sissu and cosy evenings by the Beas river.",
    included: ["4 nights in a mountain-view hotel", "Breakfast and dinner", "Volvo from Delhi and local transfers", "Welcome drink"],
    excluded: ["Snow activities and equipment", "Lunch", "Heater charges", "Personal expenses"],
    images: [img("photo-1626621341517-bbf3d9990a23")],
    featured: true,
  },
  {
    title: "Jaipur and Udaipur Heritage",
    destination: "Rajasthan",
    price: 20999,
    days: 5,
    nights: 4,
    description: "Palaces, step wells and lake views. Two cities, one comfortable drive between them.",
    included: ["4 nights in heritage hotels", "Daily breakfast", "Private car with driver", "Guided city tours"],
    excluded: ["Monument entry fees", "Lunch and dinner", "Camel and jeep safaris"],
    images: [img("photo-1477587458883-47145ed94245")],
    featured: false,
  },
];

const vehicles = [
  {
    name: "Maruti Dzire",
    type: "Car",
    seats: 4,
    pricePerDay: 2500,
    pricePerKm: 12,
    description: "Compact, fuel-efficient sedan for city trips and short getaways.",
    features: ["AC", "Music system", "Boot space for 2 bags", "Experienced driver"],
    images: [img("photo-1549317661-bd32c8ce0db2")],
  },
  {
    name: "Toyota Innova Crysta",
    type: "SUV",
    seats: 7,
    pricePerDay: 4500,
    pricePerKm: 18,
    description: "Roomy and comfortable on long routes and hill roads. Ideal for families.",
    features: ["Dual AC", "Captain seats", "Large luggage space", "Charging points"],
    images: [img("photo-1533473359331-0135ef1b58bf")],
  },
  {
    name: "Tempo Traveller 12 seater",
    type: "Tempo Traveller",
    seats: 12,
    pricePerDay: 7500,
    pricePerKm: 24,
    description: "Push-back seats and plenty of legroom for group tours and weddings.",
    features: ["AC", "Push-back seats", "Music system", "Roof carrier"],
    images: [img("photo-1544620347-c4fd4a3d5957")],
  },
];

const offers = [
  {
    title: "Winter sale: 15% off Manali and Kashmir packages",
    body: "Book before 30 November and travel any time till March. Valid for groups of 4 or more.",
    badge: "Hot",
    image: img("photo-1626621341517-bbf3d9990a23"),
    validTill: new Date(now.getFullYear(), 10, 30),
  },
  {
    title: "New: weekend Tempo Traveller deals",
    body: "Flat Rs. 1,000 off on 12-seater rentals for Saturday and Sunday trips. Mention this offer while booking.",
    badge: "New",
  },
  {
    title: "Travel update: Atal Tunnel is open year round",
    body: "Roads to Lahaul stay accessible through winter except during heavy snowfall. We will keep you updated on the day of travel.",
    badge: "News",
  },
];

await mongoose.connect(uri);
const db = mongoose.connection;

const insert = async (name, docs) => {
  const col = db.collection(name);
  if ((await col.countDocuments()) > 0) {
    console.log(`- ${name}: already has data, skipped`);
    return;
  }
  await col.insertMany(docs.map((d, i) => ({ ...d, ...stamp(i) })));
  console.log(`- ${name}: added ${docs.length}`);
};

await insert("packages", packages);
await insert("vehicles", vehicles);
await insert("offers", offers);

await mongoose.disconnect();
console.log("Done.");
