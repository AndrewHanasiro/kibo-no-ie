import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import * as logger from "firebase-functions/logger";

const auth = getAuth();
const bucket = getStorage().bucket();
/**
 * Helper to validate Firebase ID Tokens
 */
export const validateAuth = async (request: any): Promise<boolean> => {
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

export const uploadToStorage = async (image: string): Promise<string> => {
  const [metadata, base64EncodedImageString] = image.split(";base64,");
  if (!base64EncodedImageString) {
    throw new Error("Invalid image format");
  }
  const contentType = metadata.split(":")[1];
  const imageBuffer = Buffer.from(base64EncodedImageString, "base64");

  // Generate a unique filename and path in Firebase Storage
  const fileExtension = contentType.split("/")[1] || "jpeg";
  const filename = `shops/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  const file = bucket.file(filename);

  // Upload the image buffer to Firebase Storage
  await file.save(imageBuffer, { metadata: { contentType }, public: true });
  return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
};
