// Calculate distance in miles using Haversine formula
export function calculateDistance(coords: number[][]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1];
    const [lon2, lat2] = coords[i];
    const R = 3958.8; // Earth radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return Math.round(total * 10) / 10;
}

// Calculate elevation gain in feet
export function calculateElevationGain(coords: number[][]): number {
  let gain = 0;
  for (let i = 1; i < coords.length; i++) {
    const elevDiff = (coords[i][2] || 0) - (coords[i - 1][2] || 0);
    if (elevDiff > 0) gain += elevDiff;
  }
  return Math.round(gain * 3.28084); // meters to feet
}
