const BASE_URL = "http://127.0.0.1:5000";

/** Helper – returns the stored JWT or null */
const getToken = (): string | null => localStorage.getItem("token");

/** Build an Authorization header object when a token is present */
const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (identifier: string, password: string) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await response.json();

  if (response.ok && data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};


export const signup = async (data: { name: string; email: string; password: string }) => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};


export const generateItinerary = async (data: {
  destination: string;
  travelers: number;
  startDate: string;
  endDate: string;
  preferences?: string;
  budget?: string;
}) => {


  const params = new URLSearchParams({
    location: data.destination,
    travelers: String(data.travelers),
    startDate: data.startDate,
    endDate: data.endDate,
    preferences: data.preferences || "",
    budget: data.budget || "",
  });

  const res = await fetch(`${BASE_URL}/api/trips/create?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to generate itinerary (${res.status})`);
  }

  return res.json();
};


// ─── My Trips ────────────────────────────────────────────────────────────────

/** Fetch all trips for the currently authenticated user */
export const getUserTrips = async () => {
  const res = await fetch(`${BASE_URL}/api/trips/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch trips (${res.status})`);
  }

  return res.json();
};

/** Delete a trip by its ID */
export const deleteTrip = async (tripId: string) => {
  const res = await fetch(`${BASE_URL}/api/trips/${tripId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete trip (${res.status})`);
  }

  return res.json();
};