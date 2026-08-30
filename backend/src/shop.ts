import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/https";
import { uploadToStorage, validateAuth } from "./helper";
import { getDatabase } from "firebase-admin/database";

const db = getDatabase();

type Location = {
  latitude: number;
  longitude: number;
};

type Shop = {
  name: string;
  locations: Location[];
  image: string;
};

/**
 * 1. List Shop
 * Fetches name, locations and image from the 'shops' collection.
 */
export const listShop = onRequest({ cors: true }, async (request, response) => {
  try {
    const snapshot = await db.ref("shops").once("value");
    const data = snapshot.val() satisfies Record<string, Shop>;

    response.set("Cache-Control", "public, max-age=300, s-maxage=600");

    if (!data) {
      response.status(200).json([]);
      return;
    }
    const shopList = Object.keys(data).map((id) => ({
      id,
      name: data[id].name,
      locations: data[id].locations || [],
      image: data[id].image,
    }));
    response.status(200).json(shopList);
  } catch (error) {
    logger.error("Error fetching shops", error);
    response.status(500).send("Internal Server Error");
  }
});

/**
 * 2. Update Shop
 * Modifies attributes based on a shop ID.
 */
export const updateShop = onRequest(
  { cors: true },
  async (request, response) => {
    const isAuthenticated = await validateAuth(request);
    if (!isAuthenticated) {
      response.status(401).send("Unauthorized");
      return;
    }
    if (request.method !== "POST" && request.method !== "PATCH") {
      response.status(405).send("Method Not Allowed");
      return;
    }
    const { id, name, locations, image } = request.body;
    if (!id) {
      response.status(400).send("Shop ID is required");
      return;
    }
    try {
      const updates: Partial<Shop> = {};
      if (name !== undefined) updates.name = name;
      if (locations !== undefined) updates.locations = locations;
      if (image !== undefined) {
        const imageUrl = await uploadToStorage(image);
        updates.image = imageUrl;
      }
      await db.ref(`shops/${id}`).update(updates);
      response.status(200).send(`Shop ${id} updated successfully`);
    } catch (error) {
      logger.error("Error updating shop", error);
      response.status(500).send("Internal Server Error");
    }
  },
);

/**
 * 3. Create Shop
 * Adds a new shop to the 'shops' collection.
 */
export const createShop = onRequest(
  { cors: true },
  async (request, response) => {
    const isAuthenticated = await validateAuth(request);
    if (!isAuthenticated) {
      response.status(401).send("Unauthorized");
      return;
    }
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }
    const { name, locations, image } = request.body;
    if (!name || !locations || !Array.isArray(locations) || !image) {
      response
        .status(400)
        .send("Missing required fields: name, locations (array), or image");
      return;
    }
    try {
      const imageUrl = await uploadToStorage(image);

      const shopsRef = db.ref("shops");
      const newShopRef = shopsRef.push();
      await newShopRef.set({
        name,
        locations,
        image: imageUrl,
        createdAt: new Date().toISOString(),
      });
      response.status(201).json({
        message: "Shop created successfully",
        id: newShopRef.key,
        imageUrl: imageUrl, // Optionally return the image URL
      });
    } catch (error) {
      logger.error("Error creating shop or uploading image", error);
      response.status(500).send("Internal Server Error");
    }
  },
);
