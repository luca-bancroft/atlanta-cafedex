import "server-only";
import type { Collection } from "mongodb";
import getMongoClient from "../mongodb";
import type { Cafe, Review } from "../../data/cafes";

async function getCafesCollection(): Promise<Collection<Cafe>> {
  const client = await getMongoClient();
  return client.db().collection<Cafe>("cafes");
}

function stripMongoId(cafe: Cafe & { _id?: unknown }): Cafe {
  const { _id, ...rest } = cafe;
  void _id;
  return rest;
}

export async function getAllCafes(): Promise<Cafe[]> {
  const collection = await getCafesCollection();
  const cafes = await collection.find({}).toArray();
  return cafes.map(stripMongoId);
}

export async function getCafeById(cafeId: string): Promise<Cafe | null> {
  const collection = await getCafesCollection();
  const cafe = await collection.findOne({ id: cafeId });
  return cafe ? stripMongoId(cafe) : null;
}

export async function insertCafe(cafe: Cafe): Promise<Cafe> {
  const collection = await getCafesCollection();
  const toInsert = { ...cafe };
  await collection.insertOne(toInsert);
  return stripMongoId(toInsert);
}

export async function updateCafe(
  cafeId: string,
  updates: Partial<Cafe>
): Promise<Cafe | null> {
  const collection = await getCafesCollection();
  const result = await collection.findOneAndUpdate(
    { id: cafeId },
    { $set: updates },
    { returnDocument: "after" }
  );
  return result ? stripMongoId(result) : null;
}

export async function deleteCafe(cafeId: string): Promise<boolean> {
  const collection = await getCafesCollection();
  const result = await collection.deleteOne({ id: cafeId });
  return result.deletedCount > 0;
}

export async function addReviewToCafe(
  cafeId: string,
  review: Review
): Promise<Cafe | null> {
  const collection = await getCafesCollection();
  const result = await collection.findOneAndUpdate(
    { id: cafeId },
    { $push: { reviews: review } },
    { returnDocument: "after" }
  );
  return result ? stripMongoId(result) : null;
}

export async function updateReviewInCafe(
  cafeId: string,
  reviewId: string,
  updates: Partial<Review>
): Promise<Cafe | null> {
  const collection = await getCafesCollection();
  const setFields = Object.fromEntries(
    Object.entries(updates).map(([key, value]) => [`reviews.$.${key}`, value])
  );
  const result = await collection.findOneAndUpdate(
    { id: cafeId, "reviews.id": reviewId },
    { $set: setFields },
    { returnDocument: "after" }
  );
  return result ? stripMongoId(result) : null;
}

export async function deleteReviewFromCafe(
  cafeId: string,
  reviewId: string
): Promise<Cafe | null> {
  const collection = await getCafesCollection();
  const result = await collection.findOneAndUpdate(
    { id: cafeId },
    { $pull: { reviews: { id: reviewId } } },
    { returnDocument: "after" }
  );
  return result ? stripMongoId(result) : null;
}
