import HomeClient from "./components/HomeClient";
import { getAllCafes } from "./lib/db/cafes";
import type { Cafe } from "./data/cafes";

export const dynamic = "force-dynamic";

async function loadCafes(): Promise<{
  cafes: Cafe[];
  dbUnavailable: boolean;
}> {
  try {
    const cafes = await getAllCafes();
    return { cafes, dbUnavailable: false };
  } catch (err) {
    console.error("Failed to load cafes from MongoDB:", err);
    return { cafes: [], dbUnavailable: true };
  }
}

export default async function Home() {
  const { cafes, dbUnavailable } = await loadCafes();
  return <HomeClient initialCafes={cafes} dbUnavailable={dbUnavailable} />;
}
