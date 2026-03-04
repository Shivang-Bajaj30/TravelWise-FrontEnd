import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Hotel,
  Bus,
  Calendar,
  ArrowLeft,
  DollarSign,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

type Coords = { lat: number; lng: number };

interface Place {
  name: string;
  details?: string;
  time?: string;
  pricing?: string;
  bestTime?: string;
  image?: string;
  location?: string; // Google Maps URL
  coordinates?: Coords;
}

interface Hotel {
  name: string;
  address?: string;
  price?: string | number;
  rating?: string | number;
  amenities?: string[];
  description?: string;
  image?: string;
  location?: string; // Google Maps URL
  coordinates?: Coords;
}

interface ItineraryData {
  places?: Place[];
  hotels?: Hotel[];
  transportation?: string[];
  costs?: string[];
  itinerary?: { day: number; activities: string[] }[];
  budget?: string | number;
  duration?: string;
}

// Haversine -> km
const haversineKm = (a: Coords, b: Coords) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth's radius km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aHarv = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
  return R * c;
};

const formatDuration = (hours: number) => {
  if (!isFinite(hours) || hours <= 0) return "—";
  const totalMin = Math.round(hours * 60);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
};

const formatBudget = (b?: string | number) => {
  if (b === undefined || b === null || b === "") return null;
  const num = typeof b === "number" ? b : Number(String(b).replace(/[^0-9.-]+/g, ""));
  if (Number.isNaN(num)) return String(b);
  return num.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
};

const DEFAULT_WALK_SPEED_KMH = 5; // conservative walking
const DEFAULT_DRIVE_SPEED_KMH = 50; // rough average, adjust per country

const MIN_GEO_UPDATE_MS = 2000; // minimum ms between updates (throttle)

const ItineraryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Try multiple nesting patterns the app may send
  let incoming: any =
    (location.state as any)?.data?.data ||
    (location.state as any)?.data ||
    (location.state as any)?.result?.data?.data ||
    (location.state as any);

  // local state to store user's coords and enhanced data
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [data, setData] = useState<ItineraryData | undefined>(() => {
    if (!incoming) return undefined;
    return incoming as ItineraryData;
  });

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // fallback sample if nothing incoming
  useEffect(() => {
    if (!incoming) {
      setData({
        places: [
          {
            name: "Santorini, Greece",
            details: "Whitewashed villages, blue domes, and breathtaking sunsets.",
            time: "Morning",
            pricing: "$20",
            bestTime: "April - October",
            image: "/images/bg1.jpg",
            location: "https://www.google.com/maps/place/Santorini",
            coordinates: { lat: 36.3932, lng: 25.4615 },
          },
        ],
        hotels: [
          {
            name: "Blue Palace Hotel",
            address: "Santorini, Greece",
            price: "$120/night",
            rating: "4.7",
            amenities: ["Pool", "WiFi", "Breakfast"],
            description: "Luxury stay with caldera views.",
            image: "/images/bg2.jpg",
            location: "https://www.google.com/maps/place/Blue+Palace",
            coordinates: { lat: 36.3932, lng: 25.5215 },
          },
        ],
        transportation: ["Bus", "Taxi", "Scooter"],
        costs: ["Flight: $300", "Hotel: $120/night", "Food: $40/day"],
        itinerary: [
          { day: 1, activities: ["Arrive in Santorini", "Check in to hotel", "Evening walk in Oia"] },
          { day: 2, activities: ["Visit Red Beach", "Explore Fira", "Sunset cruise"] },
        ],
        budget: 1000,
        duration: "3 days",
      });
    } else {
      setData(incoming as ItineraryData);
    }
  }, [incoming]);

  // Start watching user's position and update live (throttled)
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation API not available in this browser.");
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < MIN_GEO_UPDATE_MS) return; // throttle
      lastUpdateRef.current = now;
      setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn("Geolocation watch error:", err.message);
      // If permission denied, stop watching (no further prompts)
      if (err.code === err.PERMISSION_DENIED) {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      }
      // leave userCoords as-is (may be null)
    };

    // Options: tune these for battery vs accuracy
    const options: PositionOptions = {
      enableHighAccuracy: false, // set true only if you need meter-level accuracy
      maximumAge: 5000, // allow cached positions up to 5s
      timeout: 10000,
    };

    const id = navigator.geolocation.watchPosition(onSuccess, onError, options);
    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []); // run once on mount

  // Compute distance & ETA when data or userCoords change
  const [augPlaces, setAugPlaces] = useState<any[]>([]);
  const [augHotels, setAugHotels] = useState<any[]>([]);

  useEffect(() => {
    if (!data) return;
    const places = data.places ?? [];
    const hotels = data.hotels ?? [];

    if (userCoords) {
      const p = places.map((pl) => {
        const coords = pl.coordinates || null;
        if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") {
          return { ...pl, distanceKm: null, etaDrive: null, etaWalk: null };
        }
        const km = haversineKm(userCoords, coords);
        const etaDrive = km / DEFAULT_DRIVE_SPEED_KMH; // hours
        const etaWalk = km / DEFAULT_WALK_SPEED_KMH;
        return { ...pl, distanceKm: Math.round(km * 10) / 10, etaDrive: formatDuration(etaDrive), etaWalk: formatDuration(etaWalk) };
      });
      const h = hotels.map((ht) => {
        const coords = ht.coordinates || null;
        if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") {
          return { ...ht, distanceKm: null, etaDrive: null, etaWalk: null };
        }
        const km = haversineKm(userCoords, coords);
        const etaDrive = km / DEFAULT_DRIVE_SPEED_KMH;
        const etaWalk = km / DEFAULT_WALK_SPEED_KMH;
        return { ...ht, distanceKm: Math.round(km * 10) / 10, etaDrive: formatDuration(etaDrive), etaWalk: formatDuration(etaWalk) };
      });
      setAugPlaces(p);
      setAugHotels(h);
    } else {
      // no user coords -> clear augmented fields
      setAugPlaces(
        places.map((pl) => ({ ...pl, distanceKm: null, etaDrive: null, etaWalk: null }))
      );
      setAugHotels(
        hotels.map((ht) => ({ ...ht, distanceKm: null, etaDrive: null, etaWalk: null }))
      );
    }
  }, [data, userCoords]);

  const formattedBudget = formatBudget(data?.budget);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-red-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">✈️ Your Personalized Itinerary</h1>
          <p className="text-lg text-gray-600 mb-6">Explore your dream trip with curated recommendations tailored just for you.</p>
          <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white shadow-md px-6 py-2 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </motion.div>

        {/* Overview Info */}
        {(formattedBudget || data?.duration) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-md border border-orange-100 flex flex-col sm:flex-row justify-center gap-8 text-gray-800 text-lg">
            {data?.duration && (
              <p className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Duration:</span> {data.duration}
              </p>
            )}
            {formattedBudget && (
              <p className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="font-medium">Total Budget:</span> {formattedBudget}
              </p>
            )}
            {userCoords ? (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                You (approx): {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-gray-600">Location not available (grant geolocation for distances)</p>
            )}
          </motion.div>
        )}

        {/* Places & Hotels Sections */}
        {[
          {
            icon: <MapPin className="w-6 h-6" />,
            title: "Must-Visit Places",
            data: augPlaces,
            empty: "No place recommendations available.",
            render: (p: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-500">
                {p.image && <img src={p.image} alt={p.name} className="w-full h-44 object-cover rounded-lg mb-3" />}
                <h3 className="font-semibold text-lg text-gray-900">{p.name}</h3>
                {p.details && <p className="text-sm text-gray-600 mt-1">{p.details}</p>}
                <div className="text-sm text-gray-500 mt-2">
                  <div>🕒 {p.time || "Flexible"} | 💰 {p.pricing || "Free"}</div>
                  <div>🌤️ Best: {p.bestTime || "All year"}</div>
                </div>
                <div className="mt-3">
                  {p.distanceKm !== null && p.distanceKm !== undefined ? (
                    <>
                      <div className="text-sm text-gray-700 font-medium">{p.distanceKm} km away</div>
                      <div className="text-xs text-gray-500">Drive: {p.etaDrive} • Walk: {p.etaWalk}</div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400">Distance unavailable</div>
                  )}
                  {p.location && (
                    <a href={p.location} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-sm text-blue-600 hover:underline">
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </motion.div>
            ),
          },
          {
            icon: <Hotel className="w-6 h-6" />,
            title: "Recommended Hotels",
            data: augHotels,
            empty: "No hotel data available.",
            render: (h: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-500">
                {h.image && <img src={h.image} alt={h.name} className="w-full h-44 object-cover rounded-lg mb-3" />}
                <h3 className="font-semibold text-lg text-gray-900">{h.name}</h3>
                {h.description && <p className="text-sm text-gray-600 mt-1">{h.description}</p>}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-700 font-medium">💵 {h.price ?? "N/A"}</span>
                  <span className="text-sm text-gray-700">⭐ {h.rating ?? "N/A"}</span>
                </div>
                {h.address && <p className="text-sm text-gray-500 mt-1">📍 {h.address}</p>}
                {h.amenities && h.amenities.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">🛎️ {h.amenities.join(", ")}</p>
                )}

                <div className="mt-3">
                  {h.distanceKm !== null && h.distanceKm !== undefined ? (
                    <div className="text-sm text-gray-700 font-medium">
                      {h.distanceKm} km away — Drive: {h.etaDrive} • Walk: {h.etaWalk}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">Distance unavailable</div>
                  )}
                  {h.location && (
                    <a href={h.location} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-blue-600 hover:underline">
                      View on Map
                    </a>
                  )}
                </div>
              </motion.div>
            ),
          },
        ].map((section, index) => (
          <Card key={index} className="shadow-md border border-orange-100 bg-gradient-to-b from-white to-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600 text-2xl">
                {section.icon} {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.data && section.data.length > 0 ? section.data.map(section.render) : <p className="text-gray-600">{section.empty}</p>}
            </CardContent>
          </Card>
        ))}

        {/* Transportation */}
        <Card className="shadow-md border border-orange-100 bg-gradient-to-b from-white to-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 text-2xl">
              <Bus className="w-6 h-6" /> Transportation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.transportation?.length ? (
              <ul className="list-disc ml-6 text-gray-700 space-y-1">{data.transportation!.map((t, i) => <li key={i}>{t}</li>)}</ul>
            ) : (
              <p className="text-gray-600">No transportation data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="shadow-md border border-orange-100 bg-gradient-to-b from-white to-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 text-2xl">
              <DollarSign className="w-6 h-6" /> Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.costs?.length ? (
              <ul className="list-disc ml-6 text-gray-700 space-y-1">{data.costs!.map((c, i) => <li key={i}>{c}</li>)}</ul>
            ) : (
              <p className="text-gray-600">No cost information available.</p>
            )}
          </CardContent>
        </Card>

        {/* Daily Itinerary */}
        <Card className="shadow-md border border-orange-100 bg-gradient-to-b from-white to-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 text-2xl">
              <Calendar className="w-6 h-6" /> Daily Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.itinerary?.length ? (
              data.itinerary!.map((day, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Day {day.day}</h3>
                  <ul className="list-disc ml-6 text-gray-700 space-y-1">{day.activities?.map((a, j) => <li key={j}>{a}</li>)}</ul>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-600">No daily itinerary available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItineraryPage;