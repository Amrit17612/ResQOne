/**
 * Calculates straight-line spherical distance between two coordinates in kilometers.
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

/**
 * Calculates road routing distance and estimated travel time (ETA)
 * Uses urban congestion factor heuristics (average 35 km/h emergency response speed in city traffic)
 * with road-network curvature factor (1.28x over straight-line distance).
 */
export const calculateRoadRouting = (lat1, lon1, lat2, lon2, vehicleSpeedKmh = 40) => {
  const straightDist = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  // Realistic urban road detour factor
  const roadDistanceKm = Math.round(straightDist * 1.28 * 10) / 10;
  // Estimated travel time in minutes
  const etaMinutes = Math.max(1, Math.round((roadDistanceKm / vehicleSpeedKmh) * 60));

  return {
    roadDistanceKm,
    straightDistKm: straightDist,
    etaMinutes,
    etaFormatted: `${etaMinutes} mins`
  };
};

