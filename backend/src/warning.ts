import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/https";
import { validateAuth } from "./helper";

const db = getDatabase();

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

    response.set("Cache-Control", "public, max-age=300, s-maxage=600");

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
  const rawText = request.body.text;
  if (!rawText || typeof rawText !== "string") {
    response
      .status(400)
      .send("Missing required fields: text");
    return;
  }
  
  if (rawText.length > 500) {
    response.status(400).send("Text exceeds maximum length of 500 characters");
    return;
  }
  
  // Basic HTML escaping
  const text = rawText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  try {
    const warningsRef = db.ref("warnings");
    const newWarningRef = warningsRef.push();
    await newWarningRef.set({
      text,
      timestamp: new Date().toISOString(),
    });
    
    // Send push notification to all users subscribed to "warnings"
    let pushFailed = false;
    try {
      await getMessaging().send({
        topic: "warnings",
        notification: {
          title: "Novo Aviso Oficial",
          body: text,
        },
      });
      logger.info("Push notification sent to warnings topic.");
    } catch (messagingError) {
      logger.error("Error sending push notification", messagingError);
      pushFailed = true;
    }

    response.status(201).json({
      message: pushFailed ? "Warning created but push notification failed" : "Warning created successfully",
      id: newWarningRef.key,
      partialFailure: pushFailed,
    });
  } catch (error) {
    logger.error("Error creating warning", error);
    response.status(500).send("Internal Server Error");
  }
});

/**
 * 6. Delete Warning
 * Removes a warning by ID.
 */
export const deleteWarning = onRequest({ cors: true }, async (request, response) => {
  const isAuthenticated = await validateAuth(request);
  if (!isAuthenticated) {
    response.status(401).send("Unauthorized");
    return;
  }
  if (request.method !== "DELETE") {
    response.status(405).send("Method Not Allowed");
    return;
  }
  
  const id = request.query.id || request.body.id;
  
  if (!id || typeof id !== "string") {
    response.status(400).send("Warning ID is required");
    return;
  }
  
  try {
    await db.ref(`warnings/${id}`).remove();
    response.status(200).send(`Warning ${id} deleted successfully`);
  } catch (error) {
    logger.error("Error deleting warning", error);
    response.status(500).send("Internal Server Error");
  }
});
