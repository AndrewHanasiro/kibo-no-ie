import { getDatabase } from "firebase-admin/database";
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
