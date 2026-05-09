import admin from "firebase-admin";
import {     readFileSync } from "fs";
import { join } from "path";
import { CONFIG } from "./constants.js";

/* const serviceAccount = JSON.parse(
  readFileSync(join(process.cwd(), "serviceAccountKey.json"), "utf8")
);
 */
admin.initializeApp({
  credential: admin.credential.cert({ 
    projectId: CONFIG.FIREBASE_PROJECT_ID,
    clientEmail: CONFIG.FIREBASE_CLIENT_EMAIL,
    privateKey: CONFIG.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

export const db = admin.firestore();
export const auth = admin.auth();

