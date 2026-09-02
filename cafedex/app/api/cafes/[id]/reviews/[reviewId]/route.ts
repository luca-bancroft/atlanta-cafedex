import { auth } from "@/auth";
import {
  deleteReviewFromCafe,
  getCafeById,
  updateReviewInCafe,
} from "@/app/lib/db/cafes";
import type { Review } from "@/app/data/cafes";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; reviewId: string }> }
) {
  const session = await auth();
  if (!session?.user?.username) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id, reviewId } = await context.params;

  try {
    const cafe = await getCafeById(id);
    const existingReview = cafe?.reviews.find((r) => r.id === reviewId);
    if (!cafe || !existingReview) {
      return Response.json({ error: "Review not found." }, { status: 404 });
    }
    if (existingReview.authorUsername !== session.user.username) {
      return Response.json(
        { error: "You can only edit reviews you wrote." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Partial<Review>;
    const updates: Partial<Review> = {};
    if (typeof body.text === "string") updates.text = body.text;
    if (typeof body.rating === "number") updates.rating = body.rating;

    const updated = await updateReviewInCafe(id, reviewId, updates);
    return Response.json(updated);
  } catch (err) {
    console.error("Failed to update review in MongoDB:", err);
    return Response.json(
      { error: "Database unavailable. Try again in a moment." },
      { status: 503 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; reviewId: string }> }
) {
  const session = await auth();
  if (!session?.user?.username) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id, reviewId } = await context.params;

  try {
    const cafe = await getCafeById(id);
    const existingReview = cafe?.reviews.find((r) => r.id === reviewId);
    if (!cafe || !existingReview) {
      return Response.json({ error: "Review not found." }, { status: 404 });
    }
    if (existingReview.authorUsername !== session.user.username) {
      return Response.json(
        { error: "You can only delete reviews you wrote." },
        { status: 403 }
      );
    }

    const updated = await deleteReviewFromCafe(id, reviewId);
    return Response.json(updated);
  } catch (err) {
    console.error("Failed to delete review in MongoDB:", err);
    return Response.json(
      { error: "Database unavailable. Try again in a moment." },
      { status: 503 }
    );
  }
}
