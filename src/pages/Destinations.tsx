import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

const Destinations = () => {
  const navigate = useNavigate();

  const destinations = [
    {
      id: 1,
      name: "Paris, France",
      description: "The City of Light awaits with its iconic landmarks, world-class museums, and romantic atmosphere.",
      image: "/images/dest_paris.png",
      price: "€1,180 (₹1,06,200)",
      duration: "7 days",
      highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise"]
    },
    {
      id: 2,
      name: "Tokyo, Japan",
      description: "Experience the perfect blend of ancient traditions and cutting-edge technology in Japan's capital.",
      image: "/images/dest_tokyo.png",
      price: "¥240,000 (₹1,32,000)",
      duration: "10 days",
      highlights: ["Mount Fuji", "Shibuya Crossing", "Traditional Temples"]
    },
    {
      id: 3,
      name: "Santorini, Greece",
      description: "Discover stunning sunsets, white-washed buildings, and crystal-clear waters in this Greek paradise.",
      image: "/images/dest_santorini.png",
      price: "€900 (₹81,000)",
      duration: "5 days",
      highlights: ["Oia Village", "Blue Dome Churches", "Wine Tasting"]
    },
    {
      id: 4,
      name: "Bali, Indonesia",
      description: "Immerse yourself in tropical beauty, ancient temples, and vibrant culture on the Island of Gods.",
      image: "/images/dest_bali.png",
      price: "Rp 14,000,000 (₹75,000)",
      duration: "8 days",
      highlights: ["Rice Terraces", "Beach Resorts", "Hindu Temples"]
    },
    {
      id: 5,
      name: "New York City, USA",
      description: "The city that never sleeps offers endless entertainment, world-famous landmarks, and diverse culture.",
      image: "/images/dest_nyc.png",
      price: "$1,199 (₹1,00,000)",
      duration: "6 days",
      highlights: ["Times Square", "Central Park", "Broadway Shows"]
    },
    {
      id: 6,
      name: "Dubai, UAE",
      description: "Experience luxury and innovation in this modern desert metropolis with stunning architecture.",
      image: "/images/dest_dubai.png",
      price: "AED 5,100 (₹1,16,000)",
      duration: "7 days",
      highlights: ["Burj Khalifa", "Desert Safari", "Luxury Shopping"]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 dark:from-indigo-800 dark:via-blue-900 dark:to-purple-900 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
          >
            Explore Destinations
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-200 text-lg max-w-xl mx-auto"
          >
            Discover amazing destinations around the world. From bustling cities to serene beaches, find your perfect getaway.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Destinations Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {destinations.map((destination, i) => (
            <motion.div
              key={destination.id}
              variants={fadeInUp}
              custom={i}
              className="group bg-white dark:bg-gray-800/60 rounded-3xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url(${destination.image})`,
                    backgroundColor: '#6366f1'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                  {destination.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{destination.name}</h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                  {destination.description}
                </p>

                {/* Highlights */}
                <div className="mb-5">
                  <div className="flex flex-wrap gap-2">
                    {destination.highlights.map((highlight, index) => (
                      <span
                        key={index}
                        className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-xs font-medium"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/trip-details', { state: { selectedLocation: destination.name } })}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm shadow-md hover:shadow-lg"
                  >
                    Plan Trip
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Destinations;