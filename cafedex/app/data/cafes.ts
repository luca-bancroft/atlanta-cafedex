export type Cafe = {
  id: string;
  name: string;
  neighborhood: string;
  longitude: number;
  latitude: number;
};

export const cafes: Cafe[] = [
  {
    id: "chrome-yellow",
    name: "Chrome Yellow Trading Co.",
    neighborhood: "Old Fourth Ward",
    longitude: -84.3725,
    latitude: 33.7546,
  },
  {
    id: "condesa",
    name: "Condesa Coffee",
    neighborhood: "Old Fourth Ward",
    longitude: -84.3739,
    latitude: 33.7556,
  },
  {
    id: "dancing-goats",
    name: "Dancing Goats Coffee",
    neighborhood: "Ponce City Market",
    longitude: -84.3656,
    latitude: 33.7723,
  },
  {
    id: "spiller-park",
    name: "Spiller Park Coffee",
    neighborhood: "Ponce City Market",
    longitude: -84.3659,
    latitude: 33.7726,
  },
  {
    id: "octane-grant-park",
    name: "Octane Coffee",
    neighborhood: "Grant Park",
    longitude: -84.372,
    latitude: 33.747,
  },
  {
    id: "aurora",
    name: "Aurora Coffee",
    neighborhood: "Little Five Points",
    longitude: -84.3494,
    latitude: 33.7648,
  },
];
