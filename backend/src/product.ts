import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/https";
import { validateAuth } from "./helper";
import { getDatabase } from "firebase-admin/database";

const db = getDatabase();

type Product = {
  name: string;
  price: number;
  isAvailable: boolean;
  category: string;
  shopId?: string;
};

/**
 * 1. List Products
 * Fetches name, price, and isAvailable from the 'products' collection.
 */
export const listProducts = onRequest({ cors: true }, async (request, response) => {
  try {
    const snapshot = await db.ref("products").once("value");
    const data = snapshot.val() satisfies Record<string, Product>;
    
    if (request.query.t || request.get("Cache-Control")?.includes("no-cache")) {
      response.set("Cache-Control", "no-store, no-cache, must-revalidate");
    } else {
      response.set("Cache-Control", "public, max-age=300, s-maxage=600");
    }
    
    if (!data) {
      response.status(200).json([]);
      return;
    }
    const products = Object.keys(data).map((id) => ({
      id,
      name: data[id].name,
      price: data[id].price,
      isAvailable: data[id].isAvailable,
      category: data[id].category,
      shopId: data[id].shopId,
    }));
    response.status(200).json(products);
  } catch (error) {
    logger.error("Error fetching products", error);
    response.status(500).send("Internal Server Error");
  }
});

/**
 * 2. Update Product
 * Modifies price or isAvailable based on a product ID.
 * Expects JSON: { "id": "123", "price": 29.99, "isAvailable": true }
 */
export const updateProduct = onRequest({ cors: true }, async (request, response) => {
  if (request.method === "OPTIONS") {
    response.status(204).send();
    return;
  }
  const isAuthenticated = await validateAuth(request);
  if (!isAuthenticated) {
    response.status(401).send("Unauthorized");
    return;
  }
  if (request.method !== "POST" && request.method !== "PATCH") {
    response.status(405).send("Method Not Allowed");
    return;
  }
  const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  const { id, name, price, isAvailable, category, shopId } = body || {};
  if (!id) {
    response.status(400).send("Product ID is required");
    return;
  }
  try {
    const updates: Partial<Product> = {};
    if (price !== undefined) updates.price = Number(price);
    if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (shopId !== undefined) updates.shopId = shopId;
    await db.ref(`products/${id}`).update(updates);
    response.status(200).send(`Product ${id} updated successfully`);
  } catch (error) {
    logger.error("Error updating product", error);
    response.status(500).send("Internal Server Error");
  }
});

/**
 * 3. Create Product
 * Adds a new product to the 'products' collection.
 * Expects JSON: { "name": "Coffee", "price": 5.00, "isAvailable": true }
 */
export const createProduct = onRequest({ cors: true }, async (request, response) => {
  const isAuthenticated = await validateAuth(request);
  if (!isAuthenticated) {
    response.status(401).send("Unauthorized");
    return;
  }
  if (request.method !== "POST") {
    response.status(405).send("Method Not Allowed");
    return;
  }
  const { name, price, isAvailable, category, shopId } = request.body;
  if (!name || price === undefined || isAvailable === undefined || !category) {
    response
      .status(400)
      .send("Missing required fields: name, price, isAvailable, or category");
    return;
  }
  try {
    const productsRef = db.ref("products");
    const newProductRef = productsRef.push();
    await newProductRef.set({
      name,
      price,
      isAvailable,
      category,
      shopId: shopId || null,
      createdAt: new Date().toISOString(), // Optional: track when it was created
    });
    response.status(201).json({
      message: "Product created successfully",
      id: newProductRef.key,
    });
  } catch (error) {
    logger.error("Error creating product", error);
    response.status(500).send("Internal Server Error");
  }
});

import { onValueUpdated } from "firebase-functions/v2/database";

/**
 * 4. Product Update Trigger
 * Listens for product updates and creates a warning if the product becomes unavailable or its price changes.
 */
export const onProductUpdated = onValueUpdated("products/{productId}", async (event) => {
  const before = event.data.before.val() as Product | null;
  const after = event.data.after.val() as Product | null;

  if (!before || !after) return;

  const becameUnavailable = before.isAvailable && !after.isAvailable;
  const priceChanged = before.price !== after.price;

  if (becameUnavailable || priceChanged) {
    const text = becameUnavailable
      ? `${after.name} ficou indisponível por hoje`
      : `${after.name} mudou de R$${before.price} para R$${after.price}.`;

    await db.ref("warnings").push({
      text,
      timestamp: new Date().toISOString(),
    });
  }
});
