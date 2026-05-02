import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PhotonFeature {
  properties: {
    name: string;
    state?: string;
    country?: string;
    city?: string;
    type?: string;
  };
}

const formatPlace = (p: PhotonFeature['properties']): string => {
  const parts = [p.name];
  if (p.state && p.state !== p.name) parts.push(p.state);
  if (p.country) parts.push(p.country);
  return parts.join(', ');
};

const Home: React.FC = () => {
  const images: string[] = [
    '/images/bg1.jpg',
    '/images/bg2.jpg',
    '/images/bg3.jpg',
    '/images/bg4.jpg',
    '/images/mountains.jpg',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [prevImageIndex, setPrevImageIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isValidLocation, setIsValidLocation] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevImageIndex(currentImageIndex);
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsAnimating(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentImageIndex, images.length]);

  useEffect(() => {
    images.forEach((img) => {
      const preloadImg = new window.Image();
      preloadImg.src = img;
    });
  }, [images]);

  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => setIsAnimating(false), 700);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (location.length < 3 || isValidLocation) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoadingSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=5&lang=en`
        );
        const data = await res.json();
        const features: PhotonFeature[] = data.features || [];
        setSuggestions(features);
        setShowSuggestions(features.length > 0);
      } catch (err) {
        console.error('Photon API error:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [location, isValidLocation]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (feature: PhotonFeature) => {
    const formatted = formatPlace(feature.properties);
    setLocation(formatted);
    setIsValidLocation(true);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    setIsValidLocation(false); // clear validation when user types
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location && isValidLocation) {
      navigate('/trip-details', { state: { selectedLocation: location } });
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' as const },
    }),
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full flex items-center justify-center h-[55vh] sm:h-[65vh] lg:h-[85vh] mt-[-3px]">
        {/* Background Image Container */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {isAnimating && prevImageIndex !== null && (
            <motion.div
              key={images[prevImageIndex] + '-prev'}
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${images[prevImageIndex]})`,
                filter: 'brightness(0.55)',
              }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
            />
          )}
          <motion.div
            key={images[currentImageIndex] + '-current'}
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${images[currentImageIndex]})`,
              filter: 'brightness(0.45)',
            }}
            initial={{ opacity: prevImageIndex === null ? 1 : 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prevImageIndex === null ? 0 : 0.7, ease: 'easeInOut' }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 text-center w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-6"
          >
            <span className="text-sm">✨</span>
            <span className="text-white/90 text-sm font-medium">AI-Powered Trip Planning</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white font-extrabold mb-5 leading-tight text-3xl sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            Discover Your Next
            <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-teal-300 bg-clip-text text-transparent">
              Adventure
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/80 mb-8 max-w-xs sm:max-w-lg md:max-w-2xl text-sm sm:text-lg md:text-xl"
          >
            Plan your perfect trip with TravelWise – AI generates personalized itineraries with hotels, places, and real-time navigation.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-md sm:max-w-xl relative z-[1010]"
          >
            <div className="relative w-full flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                ref={inputRef}
                value={location}
                onChange={handleInputChange}
                placeholder="Where would you like to go?"
                className={`pl-12 pr-4 py-3.5 rounded-2xl text-sm sm:text-base w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 transition-colors ${isValidLocation
                  ? 'border-emerald-400/60 ring-1 ring-emerald-400/30'
                  : 'border-white/30'
                  }`}
              />
              {isValidLocation && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
              {isLoadingSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <ul ref={dropdownRef} className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-2 z-[1000] max-h-60 overflow-y-auto">
                  {suggestions.map((feature, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(feature)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer text-gray-700 dark:text-gray-300 text-sm transition-colors"
                    >
                      <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span>{formatPlace(feature.properties)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {!isLoadingSuggestions && location.length >= 3 && !isValidLocation && suggestions.length === 0 && showSuggestions === false && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-2 z-[1000] px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
                  No locations found. Try a different search.
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!isValidLocation}
              className={`px-7 py-3.5 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg ${isValidLocation
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-gray-400/50 text-white/60 cursor-not-allowed shadow-none'
                }`}
            >
              Explore
            </button>
          </motion.form>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-white/80 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* How It Works */}
      <section className="py-16 sm:py-24 px-4 bg-white dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-14"
          >
            <motion.span variants={fadeInUp} custom={0} className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
              Simple Process
            </motion.span>
            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mt-3">
              How It Works
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose Destination', desc: 'Enter where you want to go and your travel dates.', icon: '🗺️', color: 'from-indigo-500 to-blue-500' },
              { step: '02', title: 'AI Generates Plan', desc: 'Our AI creates a personalized itinerary with hotels, places & costs.', icon: '🤖', color: 'from-purple-500 to-pink-500' },
              { step: '03', title: 'Explore & Navigate', desc: 'Get real-time directions, distances, and ETAs to each spot.', icon: '🧭', color: 'from-teal-500 to-emerald-500' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                custom={i}
                className="group relative bg-white dark:bg-gray-800/60 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest">Step {item.step}</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-14"
          >
            <motion.span variants={fadeInUp} custom={0} className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wider">
              Top Picks
            </motion.span>
            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mt-3">
              Popular Destinations
            </motion.h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {
              [
                {
                  id: 1,
                  name: "Paris, France",
                  description: "The City of Light awaits with its iconic landmarks, world-class museums, and romantic atmosphere.",
                  image: "/images/paris.png",
                  price: "From $1,299",
                  duration: "7 days",
                  highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise"]
                },
                {
                  id: 2,
                  name: "Bali, Indonesia",
                  description: "Immerse yourself in tropical beauty, ancient temples, and vibrant culture on the Island of Gods.",
                  image: "/images/bali.png",
                  price: "From $899",
                  duration: "8 days",
                  highlights: ["Rice Terraces", "Beach Resorts", "Hindu Temples"]
                },
                {
                  id: 3,
                  name: "Dubai, UAE",
                  description: "Experience luxury and innovation in this modern desert metropolis with stunning architecture.",
                  image: "/images/dubai.jpg",
                  price: "From $1,399",
                  duration: "7 days",
                  highlights: ["Burj Khalifa", "Desert Safari", "Luxury Shopping"]
                }
              ].map((dest, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  custom={i}
                  className="group bg-white dark:bg-gray-800/60 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="h-48 sm:h-56 w-full relative overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-white border border-white/20">
                      Featured
                    </div>
                    <h3 className="absolute bottom-4 left-5 text-xl font-bold text-white drop-shadow-lg">{dest.name}</h3>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-gray-600 dark:text-gray-400 text-sm flex-1 leading-relaxed">{dest.description}</p>
                    <button
                      onClick={() => navigate('/trip-details', { state: { selectedLocation: dest.name } })}
                      className="mt-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 w-max self-start text-sm"
                    >
                      Plan Trip →
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-800 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Trips Planned' },
              { value: '150+', label: 'Destinations' },
              { value: '50K+', label: 'Happy Travelers' },
              { value: '4.9', label: 'App Rating' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-indigo-200 text-sm sm:text-base font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-50 via-purple-50 to-teal-50 dark:from-indigo-950/50 dark:via-purple-950/30 dark:to-teal-950/20 rounded-3xl p-10 sm:p-16 border border-indigo-100 dark:border-indigo-800/50"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto text-base sm:text-lg">
              Let our AI plan your perfect trip in minutes. Enter a destination and get a complete itinerary with hotels, attractions, and real-time directions.
            </p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                inputRef.current?.focus();
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              Plan Your Trip Now ✨
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;