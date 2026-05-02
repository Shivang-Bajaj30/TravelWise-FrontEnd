import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

const Packages = () => {
  const navigate = useNavigate();

  const packages = [
    {
      id: 1,
      name: "European Grand Tour",
      description: "Experience the best of Europe with visits to Paris, Rome, Barcelona, and Amsterdam. Perfect for first-time visitors.",
      image: "/images/europe_grand_tour.png",
      price: "€2,499 (₹2,25,000)",
      duration: "14 days",
      destinations: ["Paris", "Rome", "Barcelona", "Amsterdam"],
      includes: ["Flights", "Hotels", "Guided Tours", "Breakfast"],
      rating: 4.8,
      reviews: 156
    },
    {
      id: 2,
      name: "Asian Adventure",
      description: "Discover the wonders of Asia with stops in Tokyo, Bangkok, Singapore, and Bali. Culture, cuisine, and adventure await.",
      image: "/images/asian_adventure.png",
      price: "¥345,000 (₹1,89,900)",
      duration: "12 days",
      destinations: ["Tokyo", "Bangkok", "Singapore", "Bali"],
      includes: ["Flights", "Hotels", "Local Transport", "Some Meals"],
      rating: 4.7,
      reviews: 203
    },
    {
      id: 3,
      name: "Mediterranean Cruise",
      description: "Sail through the Mediterranean with stops at beautiful coastal cities. Luxury and relaxation combined.",
      image: "/images/mediterranean_cruise.png",
      price: "€699 (₹62,900)",
      duration: "4 days",
      destinations: ["Barcelona", "Nice", "Rome", "Santorini"],
      includes: ["Cruise Ship", "All Meals", "Entertainment", "Shore Excursions"],
      rating: 4.9,
      reviews: 89
    },
    {
      id: 4,
      name: "Safari & Beach Combo",
      description: "Experience the best of Africa with a Kenyan safari followed by relaxation on Zanzibar's pristine beaches.",
      image: "/images/safari_beach.png",
      price: "KSh 510,000 (₹3,31,000)",
      duration: "11 days",
      destinations: ["Nairobi", "Masai Mara", "Zanzibar"],
      includes: ["Flights", "Safari Lodge", "Beach Resort", "Game Drives"],
      rating: 4.9,
      reviews: 67
    },
    {
      id: 5,
      name: "South American Explorer",
      description: "Journey through South America visiting Peru, Chile, and Argentina. Ancient ruins, wine country, and vibrant cities.",
      image: "/images/south_america.png",
      price: "$2,799 (₹2,33,700)",
      duration: "16 days",
      destinations: ["Lima", "Cusco", "Santiago", "Buenos Aires"],
      includes: ["Flights", "Hotels", "Machu Picchu Tour", "Wine Tasting"],
      rating: 4.6,
      reviews: 124
    },
    {
      id: 6,
      name: "Northern Lights Adventure",
      description: "Chase the Aurora Borealis in Iceland and Norway. Winter wonderland with unique experiences and natural phenomena.",
      image: "/images/northern_lights.png",
      price: "kr 28,000 (₹2,18,400)",
      duration: "8 days",
      destinations: ["Reykjavik", "Tromsø", "Bergen"],
      includes: ["Flights", "Hotels", "Northern Lights Tours", "Winter Activities"],
      rating: 4.8,
      reviews: 91
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 dark:from-purple-800 dark:via-indigo-900 dark:to-blue-900 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
          >
            Travel Packages
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-purple-200 text-lg max-w-xl mx-auto"
          >
            Carefully crafted travel packages designed to give you the perfect vacation experience.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Packages Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              variants={fadeInUp}
              custom={i}
              className="group bg-white dark:bg-gray-800/60 rounded-3xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url(${pkg.image})`,
                    backgroundColor: '#7c3aed'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                  {pkg.duration}
                </div>
                <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Package Deal
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                    {pkg.price} <span className="text-xs font-normal opacity-80">/ person</span>
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, j) => (
                      <svg
                        key={j}
                        className={`w-4 h-4 ${j < Math.floor(pkg.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{pkg.rating} ({pkg.reviews} reviews)</span>
                </div>

                {/* Destinations */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Destinations</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.destinations.map((destination, index) => (
                      <span
                        key={index}
                        className="bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-lg text-xs font-medium"
                      >
                        {destination}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Includes */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Includes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.includes.map((item, index) => (
                      <span
                        key={index}
                        className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/trip-details', { state: { selectedLocation: pkg.destinations[0] } })}
                      className="flex-1 bg-linear-to-r from-indigo-500 to-purple-600 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm cursor-pointer shadow-md hover:shadow-lg"
                    >
                      Book Now
                    </button>
                    <button className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 text-sm cursor-pointer">
                      Details
                    </button>
                  </div>
                  <button className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 text-sm cursor-pointer">
                    Save
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

export default Packages;