import { auth } from "@/auth";
import { deleteCafe, getCafeById, updateCafe } from "@/app/lib/db/cafes";
import type { Cafe } from "@/app/data/cafes";

const EDITABLE_FIELDS = [
  "name",
  "description",
  "metCriteria",
  "rating",
  "distinguished",
  "distinguishedReason",
  "detriment",
  "detrimentReason",
] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.username) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await getCafeById(id);
    if (!existing) {
      return Response.json({ error: "Cafe not found." }, { status: 404 });
    }
    if (existing.createdBy !== session.user.username) {
      return Response.json(
        { error: "You can only edit cafes you added." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Partial<Cafe>;
    const updates: Partial<Cafe> = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) {
        (updates as Record<string, unknown>)[field] = body[field];
      }
    }

    const updated = await updateCafe(id, updates);
    return Response.json(updated);
  } catch (err) {
    console.error("Failed to update cafe in MongoDB:", err);
    return Response.json(
      { error: "Database unavailable. Try again in a moment." },
      { status: 503 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.username) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await getCafeById(id);
    if (!existing) {
      return Response.json({ error: "Cafe not found." }, { status: 404 });
    }
    if (existing.createdBy !== session.user.username) {
      return Response.json(
        { error: "You can only delete cafes you added." },
        { status: 403 }
      );
    }

    await deleteCafe(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Failed to delete cafe in MongoDB:", err);
    return Response.json(
      { error: "Database unavailable. Try again in a moment." },
      { status: 503 }
    );
  }
}
