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

export async function insertCafe(cafe: Cafe): Promise<Cafe> {
  const collection = await getCafesCollection();
  const toInsert = { ...cafe };
  await collection.insertOne(toInsert);
  return stripMongoId(toInsert);
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
