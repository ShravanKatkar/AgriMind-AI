export interface IndianLocation {
  id: string
  name: string
  state: string
  latitude: number
  longitude: number
}

// Keep alias for backwards compatibility
export type SriLankaLocation = IndianLocation

export const INDIAN_LOCATIONS: IndianLocation[] = [
  { id: "pune", name: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567 },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777 },
  { id: "nashik", name: "Nashik", state: "Maharashtra", latitude: 19.9975, longitude: 73.7898 },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", latitude: 21.1458, longitude: 79.0882 },
  { id: "sambhajinagar", name: "Chhatrapati Sambhajinagar", state: "Maharashtra", latitude: 19.8762, longitude: 75.3433 },
  { id: "delhi", name: "Delhi", state: "Delhi NCR", latitude: 28.6139, longitude: 77.209 },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462 },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873 },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", latitude: 17.385, longitude: 78.4867 },
  { id: "chandigarh", name: "Chandigarh", state: "Punjab", latitude: 30.7333, longitude: 76.7794 },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714 },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", latitude: 23.2599, longitude: 77.4126 },
]

export const SRI_LANKA_LOCATIONS = INDIAN_LOCATIONS

export function getLocationById(id: string): IndianLocation {
  return (
    INDIAN_LOCATIONS.find((l) => l.id.toLowerCase() === id.toLowerCase()) ??
    INDIAN_LOCATIONS[0]
  )
}
