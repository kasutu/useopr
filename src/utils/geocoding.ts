export interface GeocodingResult {
  place_name: string;
  center: [number, number]; // [lng, lat]
  text: string;
}

export async function geocodeAddress(
  apiKey: string,
  query: string,
  proximity?: { lat: number; lng: number }
): Promise<GeocodingResult[]> {
  const proximityParam = proximity 
    ? `&proximity=${proximity.lng},${proximity.lat}` 
    : '';
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${apiKey}${proximityParam}&limit=5`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}
