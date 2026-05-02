import { useEffect, useState, useRef, useCallback } from "react";
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
  Navigation2,
  Download,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

type Coords = { lat: number; lng: number };

interface Place {
  name: string;
  details?: string;
  time?: string;
  pricing?: string;
  bestTime?: string;
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

/**
 * Build a Google Maps Directions URL.
 * - origin = user's current location (if available)
 * - destination = coordinates (if available) OR fallback to place name search
 */
const getDirectionsUrl = (
  userCoords: Coords | null,
  destination: { name: string; coordinates?: Coords; address?: string }
): string => {
  const base = "https://www.google.com/maps/dir/?api=1";

  // Origin: user's live location
  const origin = userCoords
    ? `&origin=${userCoords.lat},${userCoords.lng}`
    : ""; // omit origin → Google Maps will prompt user for it

  // Destination: prefer coordinates, fallback to name + address search
  let dest: string;
  if (
    destination.coordinates &&
    typeof destination.coordinates.lat === "number" &&
    typeof destination.coordinates.lng === "number"
  ) {
    dest = `${destination.coordinates.lat},${destination.coordinates.lng}`;
  } else {
    // use name + address as a search query
    dest = encodeURIComponent(
      [destination.name, destination.address].filter(Boolean).join(", ")
    );
  }

  return `${base}${origin}&destination=${dest}&travelmode=driving`;
};

const ItineraryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Extract trip metadata passed from TripDetails page
  const tripMeta = {
    destination: (location.state as any)?.destination || "",
    startDate: (location.state as any)?.startDate || "",
    endDate: (location.state as any)?.endDate || "",
    travelers: (location.state as any)?.travelers || 0,
  };

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

  const handleSavePdf = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-background to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
            {tripMeta.destination ? `✈️ ${tripMeta.destination}` : "✈️ Your Personalized Itinerary"}
          </h1>
          {tripMeta.destination && (
            <p className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Travel Itinerary</p>
          )}
          {/* Trip meta badges */}
          {(tripMeta.startDate || tripMeta.travelers > 0 || data?.duration) && (
            <div className="flex justify-center flex-wrap gap-3 mb-4 mt-3">
              {data?.duration && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4" /> {data.duration}
                </span>
              )}
              {tripMeta.startDate && tripMeta.endDate && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4" /> {new Date(tripMeta.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(tripMeta.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              {tripMeta.travelers > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-full">
                  <Users className="w-4 h-4" /> {tripMeta.travelers} {tripMeta.travelers === 1 ? "Traveler" : "Travelers"}
                </span>
              )}
              {formattedBudget && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full">
                  <DollarSign className="w-4 h-4" /> {formattedBudget}
                </span>
              )}
            </div>
          )}
          <p className="text-base text-gray-500 dark:text-gray-400 mb-6">Curated recommendations tailored just for you.</p>
          <div className="flex justify-center gap-3 flex-wrap no-print">
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 px-6 py-2 rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
            <Button
              onClick={handleSavePdf}
              className="no-print bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 px-6 py-2 rounded-full"
            >
              <Download className="w-4 h-4 mr-2" /> Save as PDF
            </Button>
          </div>
        </motion.div>

        {/* PDF-captured content starts here */}
        <div ref={contentRef} className="space-y-10">


          {/* Places & Hotels Sections */}
          {[
            {
              icon: <MapPin className="w-6 h-6" />,
              title: "Must-Visit Places",
              data: augPlaces,
              empty: "No place recommendations available.",
              render: (p: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }} className="group bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-500 overflow-hidden">
                  {/* Accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5 w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                        <MapPin className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug">{p.name}</h3>
                        {p.details && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{p.details}</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" /> {p.time || "Flexible"}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 px-2.5 py-1 rounded-full"><DollarSign className="w-3 h-3" /> {p.pricing || "Free"}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full"><Calendar className="w-3 h-3" /> {p.bestTime || "All year"}</span>
                    </div>

                    {p.distanceKm !== null && p.distanceKm !== undefined && (
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{p.distanceKm} km away</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">🚗 {p.etaDrive} · 🚶 {p.etaWalk}</div>
                      </div>
                    )}

                    <a
                      href={getDirectionsUrl(userCoords, { name: p.name, coordinates: p.coordinates, address: p.details })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200"
                    >
                      <Navigation2 className="w-3.5 h-3.5" />
                      Get Directions
                    </a>
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
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }} className="group bg-white dark:bg-gray-800/60 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-500/30 transition-all duration-500 overflow-hidden">
                  {/* Accent bar */}
                  <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="shrink-0 mt-0.5 w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                          <Hotel className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug">{h.name}</h3>
                          {h.address && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" /> {h.address}</p>}
                        </div>
                      </div>
                      {h.rating && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">⭐ {h.rating}</span>
                      )}
                    </div>

                    {h.description && <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{h.description}</p>}

                    <div className="flex items-center gap-2 flex-wrap">
                      {h.price && <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-2.5 py-1 rounded-full"><DollarSign className="w-3 h-3" /> {h.price}</span>}
                    </div>

                    {h.amenities && h.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {h.amenities.map((a: string, j: number) => (
                          <span key={j} className="text-xs bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full">{a}</span>
                        ))}
                      </div>
                    )}

                    {h.distanceKm !== null && h.distanceKm !== undefined && (
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{h.distanceKm} km away</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">🚗 {h.etaDrive} · 🚶 {h.etaWalk}</div>
                      </div>
                    )}

                    <a
                      href={getDirectionsUrl(userCoords, { name: h.name, coordinates: h.coordinates, address: h.address })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200"
                    >
                      <Navigation2 className="w-3.5 h-3.5" />
                      Get Directions
                    </a>
                  </div>
                </motion.div>
              ),
            },
          ].map((section, index) => (
            <Card key={index} className="shadow-sm border border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-2xl">
                  {section.icon} {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.data && section.data.length > 0 ? section.data.map(section.render) : <p className="text-gray-600 dark:text-gray-400">{section.empty}</p>}
              </CardContent>
            </Card>
          ))}

          {/* Transportation */}
          <Card className="shadow-sm border border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-2xl">
                <Bus className="w-6 h-6" /> Transportation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.transportation?.length ? (
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">{data.transportation!.map((t, i) => <li key={i}>{t}</li>)}</ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No transportation data available.</p>
              )}
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="shadow-sm border border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-2xl">
                <DollarSign className="w-6 h-6" /> Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.costs?.length ? (
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">{data.costs!.map((c, i) => <li key={i}>{c}</li>)}</ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No cost information available.</p>
              )}
            </CardContent>
          </Card>

          {/* Daily Itinerary */}
          <Card className="shadow-sm border border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-2xl">
                <Calendar className="w-6 h-6" /> Daily Itinerary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.itinerary?.length ? (
                data.itinerary!.map((day, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-white dark:bg-gray-800/60 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Day {day.day}</h3>
                    <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">{day.activities?.map((a, j) => <li key={j}>{a}</li>)}</ul>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No daily itinerary available.</p>
              )}
            </CardContent>
          </Card>

        </div>{/* end contentRef */}
      </div>
    </div>
  );
};

export default ItineraryPage;