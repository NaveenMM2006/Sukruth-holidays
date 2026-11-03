export type Place = {
  name: string;
  label: string;
  lat: number;
  lon: number;
};

export type RouteResult = {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lat, lon] for Leaflet
};

export type VehicleTier = {
  id: string;
  name: string;
  type: string;
  seats: number;
  pricePerKm: number;
  description: string;
  image: string;
  default?: boolean;
};

export const SAMPLE_VEHICLES: VehicleTier[] = [
  {
    id: "v-innova",
    name: "Toyota Innova Crysta",
    type: "SUV",
    seats: 7,
    pricePerKm: 18, // requested default
    description: "Comfortable captain seats, rear AC & great for hill stations and family long trips.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=75",
    default: true,
  },
  {
    id: "v-dzire",
    name: "Maruti Dzire / Etios",
    type: "Sedan",
    seats: 4,
    pricePerKm: 14,
    description: "Fuel-efficient sedan for city tours, airport drops & budget couples.",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=75",
  },
  {
    id: "v-ertiga",
    name: "Maruti Ertiga / Carens",
    type: "MUV",
    seats: 6,
    pricePerKm: 16,
    description: "Spacious 6-seater MUV, ideal for small families with luggage.",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=600&q=75",
  },
  {
    id: "v-fortuner",
    name: "Toyota Fortuner 4x4",
    type: "Luxury SUV",
    seats: 7,
    pricePerKm: 24,
    description: "Premium high-stance luxury SUV for executive travel and wedding events.",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=75",
  },
  {
    id: "v-tempo",
    name: "Force Tempo Traveller",
    type: "Tempo Traveller",
    seats: 12,
    pricePerKm: 26,
    description: "Push-back recliners, high roof, music system & ample luggage for group tours.",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=75",
  },
  {
    id: "v-urbania",
    name: "Force Urbania Luxury Coach",
    type: "Mini Bus",
    seats: 17,
    pricePerKm: 34,
    description: "World-class comfort, panoramic windows, individual AC vents for large groups.",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=75",
  },
];

export const POPULAR_PLACES: Place[] = [
  { name: "Bengaluru", label: "Bengaluru, Karnataka, India", lat: 12.9767936, lon: 77.590082 },
  { name: "Mysuru", label: "Mysuru, Karnataka, India", lat: 12.305163, lon: 76.65516 },
  { name: "Coorg (Madikeri)", label: "Madikeri, Coorg, Karnataka, India", lat: 12.424424, lon: 75.73819 },
  { name: "Ooty", label: "Ooty, The Nilgiris, Tamil Nadu, India", lat: 11.4102, lon: 76.695 },
  { name: "Chikmagalur", label: "Chikmagalur, Karnataka, India", lat: 13.3161, lon: 75.772 },
  { name: "Wayanad (Kalpetta)", label: "Kalpetta, Wayanad, Kerala, India", lat: 11.6083, lon: 76.0827 },
  { name: "Goa (Panaji)", label: "Panaji, Goa, India", lat: 15.4909, lon: 73.8278 },
  { name: "Mangaluru", label: "Mangaluru, Karnataka, India", lat: 12.9141, lon: 74.856 },
];

/** Search places using Photon OpenStreetMap geocoder with Nominatim fallback */
export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  try {
    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.features?.length) {
        return data.features.map((f: any) => {
          const p = f.properties || {};
          const parts = [p.name, p.city || p.district, p.state, p.country].filter(Boolean);
          const [lon, lat] = f.geometry.coordinates;
          return {
            name: p.name || parts[0] || q,
            label: parts.join(", "),
            lat,
            lon,
          };
        });
      }
    }
  } catch (err) {
    console.warn("Photon search error, trying Nominatim fallback", err);
  }

  // Fallback to Nominatim OSM
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
      { headers: { "User-Agent": "SukruthHolidaysFareCalculator/1.0" } }
    );
    if (res.ok) {
      const list = await res.json();
      return list.map((item: any) => ({
        name: item.display_name.split(",")[0],
        label: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
    }
  } catch (err) {
    console.error("Nominatim search error", err);
  }

  return [];
}

/** Compute road driving distance and polyline using OSRM */
export async function getDrivingRoute(start: Place, end: Place): Promise<RouteResult | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.routes?.length) return null;

    const route = data.routes[0];
    const distanceKm = Math.round((route.distance / 1000) * 10) / 10; // 1 decimal place
    const durationMinutes = Math.round(route.duration / 60);

    // OSRM returns coordinates as [lon, lat]. Leaflet expects [lat, lon].
    const coordinates: [number, number][] = (route.geometry?.coordinates || []).map(
      ([lon, lat]: [number, number]) => [lat, lon]
    );

    return {
      distanceKm,
      durationMinutes,
      coordinates,
    };
  } catch (err) {
    console.error("OSRM route calculation error:", err);
    return null;
  }
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} mins`;
  if (mins === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min${mins > 1 ? "s" : ""}`;
}

