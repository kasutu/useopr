export type IslandGroup = "Luzon" | "Visayas" | "Mindanao";
export type CityType = "highly_urbanized_city" | "component_city" | "municipality";
export type SubLocalityType = "district" | "barangay";

export interface Waypoint {
  sequence: number;
  sub_locality: string;
  sub_locality_type: SubLocalityType;
  street: string;
  destination: string;
  latitude: number;
  longitude: number;
}

export interface Route {
  route_code: string;
  name: string;
  waypoints: Waypoint[];
}

export interface OPRData {
  country: "Philippines";
  country_code: "PH";
  island_group: IslandGroup;
  region: string;
  region_code: string;
  province: string;
  province_code: string;
  city: string;
  city_type: CityType;
  postal_code: string;
  latitude: number;
  longitude: number;
  routes: Route[];
}

export const DEFAULT_OPR_DATA: OPRData = {
  country: "Philippines",
  country_code: "PH",
  island_group: "Visayas",
  region: "Region 06",
  region_code: "06",
  province: "Iloilo",
  province_code: "XX",
  city: "Iloilo City",
  city_type: "municipality",
  postal_code: "0000",
  latitude: 10.7202,
  longitude: 122.5621,
  routes: [],
};
