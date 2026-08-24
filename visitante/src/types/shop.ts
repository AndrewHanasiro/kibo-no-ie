export interface Location {
  latitude: number;
  longitude: number;
}

export interface Shop {
  id: string;
  name: string;
  locations: Location[];
  image: string;
}
