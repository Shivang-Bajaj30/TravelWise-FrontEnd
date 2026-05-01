import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calendar, Users, Wand2, Plus, Minus, Sparkles, Wallet, TrendingUp, Crown } from "lucide-react";
import { generateItinerary } from "@/lib/api";

const TRAVEL_TAGS = [
  "Adventure",
  "Relaxation",
  "Culture",
  "Local Food",
  "Shopping",
  "Nature",
  "Luxury",
  "Budget-Friendly",
  "History",
  "Nightlife",
];

const BUDGET_TIERS = [
  {
    key: "low" as const,
    label: "Low",
    description: "Budget-friendly",
    icon: Wallet,
    amount: 5000,
    color: "from-emerald-600 to-teal-700",
    ring: "ring-emerald-400/50",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "medium" as const,
    label: "Medium",
    description: "Balanced comfort",
    icon: TrendingUp,
    amount: 25000,
    color: "from-amber-600 to-orange-700",
    ring: "ring-amber-400/50",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    key: "high" as const,
    label: "High",
    description: "Premium luxury",
    icon: Crown,
    amount: 100000,
    color: "from-violet-600 to-purple-700",
    ring: "ring-violet-400/50",
    text: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

type BudgetTierKey = (typeof BUDGET_TIERS)[number]["key"];

const TripDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const selectedLocation = locationState.state?.selectedLocation || "";

  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [customPref, setCustomPref] = useState("");
  const [budget, setBudget] = useState<number | string>(""); // numeric input (can be empty string)
  const [budgetTier, setBudgetTier] = useState<BudgetTierKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const dateInfo = () => {
    if (!startDate || !endDate) return null;
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const sUtc = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
      const eUtc = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
      const diffDays = Math.round((eUtc - sUtc) / (1000 * 60 * 60 * 24)); // number of nights
      const nights = Math.max(0, diffDays);
      const days = nights + 1;
      return { days, nights };
    } catch (err) {
      return null;
    }
  };

  const togglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      setError("Please select a destination first.");
      return;
    }

    // optional: basic validation for dates and budget
    if (!startDate || !endDate) {
      setError("Please provide trip dates.");
      return;
    }

    if (budget !== "" && Number(budget) < 0) {
      setError("Budget must be a non-negative number.");
      return;
    }

    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const allPrefs = [...preferences];
      if (customPref.trim()) allPrefs.push(customPref.trim());

      const result = await generateItinerary({
        destination: selectedLocation,
        travelers,
        startDate,
        endDate,
        preferences: allPrefs.join(", "),
        budget: String(budget),
      });

      console.log("AI Itinerary:", result);
      setSuccess(true);

      setTimeout(() => {
        navigate("/itinerary", {
          state: {
            data: result,
            destination: selectedLocation,
            startDate,
            endDate,
            travelers,
          },
        });
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to generate itinerary. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-[88vh] flex items-center justify-center bg-gradient-to-br from-indigo-50/50 via-background to-purple-50/50 dark:from-indigo-950/30 dark:via-background dark:to-purple-950/30 p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="max-w-3xl w-full shadow-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl rounded-3xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white">
            ✈️ Plan Your Dream Trip
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Destination:{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {selectedLocation || "Not selected"}
            </span>
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            {/* Travelers */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Travelers
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{travelers}</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTravelers(travelers + 1)}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Trip Dates
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {/* Days / Nights summary */}
              {dateInfo() && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-3">
                  <span className="font-medium">{dateInfo()!.days} {dateInfo()!.days === 1 ? 'day' : 'days'}</span>
                  <span className="text-gray-400 dark:text-gray-500">·</span>
                  <span className="font-medium">{dateInfo()!.nights} {dateInfo()!.nights === 1 ? 'night' : 'nights'}</span>
                </div>
              )}
            </div>

            {/* Total Budget */}
            <div className="md:col-span-2 space-y-3">
              <Label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Total Budget
              </Label>

              {/* Budget Tier Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {BUDGET_TIERS.map((tier) => {
                  const isActive = budgetTier === tier.key;
                  const Icon = tier.icon;
                  return (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => {
                        if (budgetTier === tier.key) {
                          setBudgetTier(null);
                          setBudget("");
                        } else {
                          setBudgetTier(tier.key);
                          setBudget(tier.amount);
                        }
                      }}
                      className={`relative group rounded-lg border p-2.5 text-center transition-all duration-300 cursor-pointer
                        ${isActive
                          ? `border-transparent bg-gradient-to-br ${tier.color} text-white shadow-md scale-[1.02]`
                          : "border-gray-300/50 dark:border-gray-600/60 bg-gray-100/60 dark:bg-gray-800/80 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm"
                        }
                      `}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`rounded-full p-1.5 transition-colors ${isActive
                            ? "bg-white/20"
                            : `${tier.bg}`
                            }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : tier.text}`} />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className={`font-semibold text-sm leading-tight ${isActive ? "text-white" : "text-gray-800 dark:text-gray-200"
                            }`}>
                            {tier.label}
                          </span>
                          <span className={`text-[11px] leading-tight ${isActive ? "text-white/75" : "text-gray-500 dark:text-gray-400"
                            }`}>
                            ~₹{tier.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                          <span className="text-[10px] font-bold">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium pointer-events-none">₹</span>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBudget(val === "" ? "" : Number(val));
                    setBudgetTier(null); // clear tier when user types custom amount
                  }}
                  placeholder="Or enter a custom amount"
                  min={0}
                  step={1}
                  className="pl-7 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="md:col-span-2 space-y-2">
              <Label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Wand2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Travel Preferences
              </Label>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_TAGS.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    size="sm"
                    variant={preferences.includes(tag) ? "default" : "outline"}
                    className={`rounded-full ${preferences.includes(tag)
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent"
                      : "text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                      }`}
                    onClick={() => togglePreference(tag)}
                  >
                    <Sparkles className="w-4 h-4 mr-1" /> {tag}
                  </Button>
                ))}
              </div>

              <Textarea
                value={customPref}
                onChange={(e) => setCustomPref(e.target.value)}
                placeholder="Add any other preferences..."
                rows={2}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {error && (
              <p className="text-red-600 dark:text-red-400 text-center md:col-span-2">{error}</p>
            )}
            {success && (
              <p className="text-green-600 dark:text-green-400 text-center md:col-span-2">
                ✅ Itinerary generated successfully!
              </p>
            )}

            <div className="text-center md:col-span-2 mt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-[1.03] transition-all text-white px-10 py-2 shadow-lg shadow-indigo-500/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Itinerary...
                  </>
                ) : (
                  "Generate AI Itinerary ✨"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TripDetailsPage;