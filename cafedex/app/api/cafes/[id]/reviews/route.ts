import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { addReviewToCafe } from "@/app/lib/db/cafes";
import type { Review } from "@/app/data/cafes";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.username) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<Review>;

  if (!body.text || typeof body.rating !== "number") {
    return Response.json(
      { error: "Invalid review payload." },
      { status: 400 }
    );
  }

  const review: Review = {
    id: randomUUID(),
    author: session.user.name ?? session.user.username,
    authorUsername: session.user.username,
    text: body.text,
    rating: body.rating,
  };

  try {
    const cafe = await addReviewToCafe(id, review);
    if (!cafe) {
      return Response.json({ error: "Cafe not found." }, { status: 404 });
    }
    return Response.json(cafe, { status: 201 });
  } catch (err) {
    console.error("Failed to add review in MongoDB:", err);
    return Response.json(
      { error: "Database unavailable. Try again in a moment." },
      { status: 503 }
    );
  }
}
