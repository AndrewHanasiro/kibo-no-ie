import { initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const app = initializeApp();
const db = getDatabase(app);

async function test() {
  const ref = db.ref("products/-P-19SZpBByrvhXYYMve");
  console.log("Updating to false...");
  await ref.update({ isAvailable: false });
  console.log("Updated to false. Waiting 5s...");
  await new Promise(r => setTimeout(r, 5000));
  console.log("Updating to true...");
  await ref.update({ isAvailable: true });
  console.log("Done.");
  process.exit(0);
}

test().catch(console.error);
