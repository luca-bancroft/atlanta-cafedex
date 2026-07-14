import { auth } from "@/auth";
import { getAllCafes, insertCafe } from "@/app/lib/db/cafes";
import type { Cafe } from "@/app/data/cafes";

export async function GET() {
  try {
    const cafes = await getAllCafes();
    return Response.json(cafes);
  } catch (err) {
    console.error("Failed to load cafes from MongoDB:", err);
    return Response.json(
      { error: "Database unavailable." },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<Cafe>;

  if (
    !body.id ||
    !body.name ||
    !body.neighborhood ||
    typeof body.longitude !== "number" ||
    typeof body.latitude !== "number" ||
    typeof body.rating !== "number" ||
    !Array.isArray(body.reviews)
  ) {
    return Response.json({ error: "Invalid cafe payload." }, { status: 400 });
  }

  try {
    const cafe = await insertCafe(body as Cafe);
    return Response.json(cafe, { status: 201 });
  } catch (err) {
    console.error("Failed to insert cafe into MongoDB:", err);
    return Response.json(
      { error: "Database unavailable. Try again in a moment." },
      { status: 503 }
    );
  }
}
