import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";

initializeApp();
const db = getDatabase();
const auth = getAuth();

setGlobalOptions({ maxInstances: 1 });

type Product = {
  name: string;
  price: number;
  isAvailable: boolean;
  category: string;
};

/**
 * Helper to validate Firebase ID Tokens
 */
const validateAuth = async (request: any): Promise<boolean> => {
  const authorization = request.get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return false;
  }
  const idToken = authorization.split("Bearer ")[1];
  try {
    await auth.verifyIdToken(idToken);
    return true;
  } catch (error) {
    logger.error("Auth validation failed", error);
    return false;
  }
};

/**
 * 1. List Products
 * Fetches name, price, and isAvailable from the 'products' collection.
 */
export const listProducts = onRequest({ cors: true }, async (request, response) => {
  try {
    const snapshot = await db.ref("products").once("value");
    const data = snapshot.val() satisfies Record<string, Product>;
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
  const isAuthenticated = await validateAuth(request);
  if (!isAuthenticated) {
    response.status(401).send("Unauthorized");
    return;
  }
  if (request.method !== "POST" && request.method !== "PATCH") {
    response.status(405).send("Method Not Allowed");
    return;
  }
  const { id, name, price, isAvailable, category } = request.body;
  if (!id) {
    response.status(400).send("Product ID is required");
    return;
  }
  try {
    const updates: Partial<Product> = {};
    if (price !== undefined) updates.price = price;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
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
  const { name, price, isAvailable, category } = request.body;
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

type Warning = {
  text: string;
  timestamp: string;
};

/**
 * 4. List Warnings
 * Fetches text from the 'warnings' collection.
 */
export const listWarning = onRequest({ cors: true }, async (request, response) => {
  try {
    const snapshot = await db.ref("warnings").once("value");
    const data = snapshot.val() satisfies Record<string, Warning>;
    if (!data) {
      response.status(200).json([]);
      return;
    }
    const warningList = Object.keys(data)
      .map((id) => ({
        id,
        text: data[id].text,
        timestamp: data[id].timestamp,
      }))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    response.status(200).json(warningList);
  } catch (error) {
    logger.error("Error fetching warnings", error);
    response.status(500).send("Internal Server Error");
  }
});

/**
 * 5. Create Warning
 * Adds a new warning to the 'warnings' collection.
 * Expects JSON: { "text": "Hey" }
 */
export const createWarning = onRequest({ cors: true }, async (request, response) => {
  const isAuthenticated = await validateAuth(request);
  if (!isAuthenticated) {
    response.status(401).send("Unauthorized");
    return;
  }
  if (request.method !== "POST") {
    response.status(405).send("Method Not Allowed");
    return;
  }
  const { text } = request.body;
  if (!text) {
    response
      .status(400)
      .send("Missing required fields: text");
    return;
  }
  try {
    const warningsRef = db.ref("warnings");
    const newWarningRef = warningsRef.push();
    await newWarningRef.set({
      text,
      timestamp: new Date().toISOString(),
    });
    response.status(201).json({
      message: "Warning created successfully",
      id: newWarningRef.key,
    });
  } catch (error) {
    logger.error("Error creating warning", error);
    response.status(500).send("Internal Server Error");
  }
});
