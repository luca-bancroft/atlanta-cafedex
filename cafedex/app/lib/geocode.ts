// Client-side helper around Mapbox's forward geocoding API, used to turn a
// typed address into map coordinates when someone submits a new cafe entry.
// Uses the same publishable token already used to render the map.

export type GeocodeResult = {
  longitude: number;
  latitude: number;
  neighborhood: string;
  placeName: string;
};

const ATLANTA_PROXIMITY = "-84.388,33.749";

type MapboxContextEntry = {
  id: string;
  text: string;
};

type MapboxFeature = {
  place_name?: string;
  center?: [number, number];
  context?: MapboxContextEntry[];
};

type MapboxGeocodeResponse = {
  features?: MapboxFeature[];
};

export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    throw new Error("Mapbox access token is not configured.");
  }

  const query = encodeURIComponent(address.trim());
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json` +
    `?access_token=${token}&limit=1&proximity=${ATLANTA_PROXIMITY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding request failed (${response.status}).`);
  }

  const data: MapboxGeocodeResponse = await response.json();
  const feature = data.features?.[0];
  if (!feature?.center) {
    return null;
  }

  const [longitude, latitude] = feature.center;
  const context = feature.context ?? [];
  const neighborhoodEntry = context.find((entry) =>
    entry.id.startsWith("neighborhood")
  );
  const placeEntry = context.find((entry) => entry.id.startsWith("place"));

  return {
    longitude,
    latitude,
    neighborhood: neighborhoodEntry?.text ?? placeEntry?.text ?? "Atlanta",
    placeName: feature.place_name ?? address,
  };
}
