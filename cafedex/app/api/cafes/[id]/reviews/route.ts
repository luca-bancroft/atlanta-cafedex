import { auth } from "@/auth";
import { addReviewToCafe } from "@/app/lib/db/cafes";
import type { Review } from "@/app/data/cafes";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<Review>;

  if (
    !body.author ||
    !body.text ||
    typeof body.rating !== "number" ||
    !Array.isArray(body.metCriteria)
  ) {
    return Response.json(
      { error: "Invalid review payload." },
      { status: 400 }
    );
  }

  try {
    const cafe = await addReviewToCafe(id, body as Review);
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
